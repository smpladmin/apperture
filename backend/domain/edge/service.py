from datetime import datetime as dt
from typing import Union
from beanie import PydanticObjectId
from fastapi import Depends
from domain.common.models import IntegrationProvider
from domain.edge.models import Edge, BaseEdge, RichEdge, AggregatedEdge, NodeTrend
from mongo.mongo import Mongo


class EdgeService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo
        self.provider_edge_build = {
            IntegrationProvider.GOOGLE: self._build_edge,
            IntegrationProvider.MIXPANEL: self._build_rich_edge,
        }
        self.provider_edge_update = {
            IntegrationProvider.GOOGLE: self._update_edges,
            IntegrationProvider.MIXPANEL: self._update_rich_edges,
        }

    def build(
        self,
        datasourceId: str,
        provider: IntegrationProvider,
        previousEvent: str,
        currentEvent: str,
        hits: int,
        date: str,
        **kwargs,
    ):
        return self.provider_edge_build[provider](
            datasourceId,
            provider,
            previousEvent,
            currentEvent,
            hits,
            date,
            **kwargs,
        )

    def _build_edge(
        self,
        datasourceId: str,
        provider: IntegrationProvider,
        previousEvent: str,
        currentEvent: str,
        hits: int,
        date: str,
        **kwargs,
    ):
        return Edge(
            datasource_id=PydanticObjectId(datasourceId),
            provider=provider,
            previous_event=previousEvent,
            current_event=currentEvent,
            users=kwargs["users"],
            hits=hits,
            date=dt.strptime(date, "%Y-%m-%d"),
        )

    def _build_rich_edge(
        self,
        datasourceId: str,
        provider: IntegrationProvider,
        previousEvent: str,
        currentEvent: str,
        hits: int,
        date: str,
        **kwargs,
    ):
        return RichEdge(
            datasource_id=PydanticObjectId(datasourceId),
            provider=provider,
            previous_event=previousEvent,
            current_event=currentEvent,
            hits=hits,
            date=dt.strptime(date, "%Y-%m-%d"),
            city=kwargs["city"],
            region=kwargs["region"],
            country=kwargs["country"],
            utm_source=kwargs["utmSource"],
            utm_medium=kwargs["utmMedium"],
            os=kwargs["os"],
            app_version=kwargs["appVersion"],
        )

    async def update_edges(
        self,
        edges: Union[list[Edge], list[RichEdge]],
        provider: IntegrationProvider,
        datasource_id: PydanticObjectId,
    ):
        await self.provider_edge_update[provider](edges, datasource_id)

    async def _update_edges(self, edges: list[Edge], datasource_id: PydanticObjectId):
        for edge in edges:
            edge.updated_at = edge.created_at
        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await Edge.find(Edge.datasource_id == datasource_id).delete()
                await Edge.insert_many(edges)

    async def _update_rich_edges(
        self, edges: list[RichEdge], datasource_id: PydanticObjectId
    ):
        for edge in edges:
            edge.updated_at = edge.created_at
        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await RichEdge.find(
                    RichEdge.datasource_id == datasource_id,
                    RichEdge.date == edges[0].date,
                ).delete()
                await RichEdge.insert_many(edges)

    async def get_edges(self, datasource_id: str) -> list[AggregatedEdge]:
        minimum_edge_count = 100
        pipeline = [
            {"$match": {"datasource_id": PydanticObjectId(datasource_id)}},
            {
                "$group": {
                    "_id": {
                        "current_event": "$current_event",
                        "previous_event": "$previous_event",
                    },
                    "hits": {"$sum": "$hits"},
                    "users": {"$sum": "$users"},
                }
            },
            {"$setWindowFields": {"output": {"totalCount": {"$count": {}}}}},
            {
                "$match": {
                    "$and": [
                        {"totalCount": {"$gte": minimum_edge_count}},
                        {"hits": {"$gte": minimum_edge_count}},
                    ]
                }
            },
            {
                "$project": {
                    "current_event": "$_id.current_event",
                    "previous_event": "$_id.previous_event",
                    "hits": 1,
                    "users": 1,
                }
            },
        ]
        return (
            await BaseEdge.find()
            .aggregate(pipeline, projection_model=AggregatedEdge)
            .to_list()
        )

    async def get_node_trends(self, datasource_id: str, node: str, trend_type: str) -> list[Edge]:
        pipeline = [
            {
                "$match": {
                    "datasource_id": PydanticObjectId(datasource_id),
                    "current_event": node,
                }
            },
            {
                "$group": {
                    "_id": {
                        "current_event": "$current_event",
                        "{}".format(trend_type): {"${}".format(trend_type): "$date"},
                        "year": {"$year": "$date"}
                    },
                    "node": {"$max": "$current_event"},
                    "hits": {"$sum": "$hits"},
                    "users": {"$sum": "$users"},
                    "date": {"$max": "$date"},
                    "week": {"$max": {"$week": "$date"}},
                    "month": {"$max": {"$month": "$date"}},
                    "year": {"$max": {"$year": "$date"}},
                    "start_date": {"$min": "$date"},
                    "end_date": {"$max": "$date"},
                }
            },
        ]

        if trend_type == 'date':
            pipeline[1]['$group']['_id'] = {'current_event': '$current_event',
                                            'date': '$date'}

        return (
            await Edge.find().aggregate(pipeline, projection_model=NodeTrend).to_list()
        )
