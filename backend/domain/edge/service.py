import asyncio
from copy import deepcopy
from datetime import datetime as dt
from datetime import timedelta
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import Depends

from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource
from domain.edge.models import (
    AggregatedEdge,
    BaseEdge,
    Edge,
    NodeSankey,
    NodeSignificance,
    NodeTrend,
    NotificationNodeData,
    RichEdge,
    SankeyDirection,
    TrendType,
)
from domain.notifications.models import Notification, NotificationThresholdType
from mongo.mongo import Mongo
from repositories.clickhouse.edges import Edges


class EdgeService:
    def __init__(self, mongo: Mongo = Depends(), edges: Edges = Depends()):
        self.mongo = mongo
        self.edges = edges
        self.provider_edge_build = {
            IntegrationProvider.GOOGLE: self._build_edge,
            IntegrationProvider.MIXPANEL: self._build_rich_edge,
            IntegrationProvider.AMPLITUDE: self._build_rich_edge,
            IntegrationProvider.CLEVERTAP: self._build_rich_edge,
        }
        self.provider_edge_update = {
            IntegrationProvider.GOOGLE: self._update_edges,
            IntegrationProvider.MIXPANEL: self._update_rich_edges,
            IntegrationProvider.AMPLITUDE: self._update_rich_edges,
            IntegrationProvider.CLEVERTAP: self._update_rich_edges,
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

    async def get_edges(
        self, datasource: DataSource, start_date: str, end_date: str
    ) -> list[AggregatedEdge]:
        if datasource.provider == IntegrationProvider.GOOGLE:
            start_date = dt.strptime(start_date, "%Y-%m-%d")
            end_date = dt.strptime(end_date, "%Y-%m-%d")
            minimum_edge_count = 100
            pipeline = [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": datasource.id},
                            {"date": {"$gte": start_date}},
                            {"date": {"$lte": end_date}},
                        ]
                    }
                },
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
                {"$sort": {"hits": -1}},
                {"$limit": minimum_edge_count},
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
        else:
            edges_tuples = await self.edges.get_edges(
                ds_id=str(datasource.id),
                start_date=start_date,
                end_date=end_date,
                app_id=str(datasource.app_id),
            )
            edges = [
                AggregatedEdge(
                    **{
                        key: tuple[i]
                        for i, key in enumerate(AggregatedEdge.__fields__.keys())
                    }
                )
                for tuple in edges_tuples
            ]
            return edges

    async def get_node_trends(
        self,
        datasource: DataSource,
        node: str,
        trend_type: TrendType,
        start_date: str,
        end_date: str,
        is_entrance_node: bool,
    ) -> list[NodeTrend]:
        if datasource.provider == IntegrationProvider.GOOGLE:
            event = "previous_event" if is_entrance_node else "current_event"
            start_date = dt.strptime(start_date, "%Y-%m-%d")
            end_date = dt.strptime(end_date, "%Y-%m-%d")
            pipeline = [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": datasource.id},
                            {f"{event}": node},
                            {"date": {"$gte": start_date}},
                            {"date": {"$lte": end_date}},
                        ]
                    }
                },
                {
                    "$group": {
                        "_id": {
                            f"{event}": f"${event}",
                            f"{trend_type}": {f"${trend_type}": "$date"},
                            "year": {"$year": "$date"},
                        },
                        "node": {"$max": f"${event}"},
                        "hits": {"$sum": "$hits"},
                        "users": {"$sum": "$users"},
                        "trend": {"$max": {f"${trend_type}": "$date"}},
                        "year": {"$max": {"$year": "$date"}},
                        "start_date": {"$min": "$date"},
                        "end_date": {"$max": "$date"},
                    }
                },
                {"$sort": {"year": 1, "trend": 1}},
            ]

            if trend_type == "date":
                pipeline[1]["$group"]["_id"] = {
                    "current_event": "$current_event",
                    "date": "$date",
                }
                pipeline[1]["$group"]["trend"] = {"$max": "$date"}

            return (
                await BaseEdge.find()
                .aggregate(pipeline, projection_model=NodeTrend)
                .to_list()
            )
        else:
            trends = self.edges.get_node_trends(
                ds_id=str(datasource.id),
                event_name=node,
                start_date=start_date,
                end_date=end_date,
                trend_type=trend_type,
            )
            return [
                NodeTrend(
                    node=node,
                    year=year,
                    trend=trend,
                    users=users,
                    hits=hits,
                    start_date=start_date,
                    end_date=end_date,
                )
                for (year, trend, users, hits, start_date, end_date) in trends
            ]

    def create_others_node(self, nodes, threshold):
        if len(nodes) > threshold:
            others_node = nodes[threshold - 1]
            if nodes[0].flow == SankeyDirection.INFLOW:
                others_node.previous_event = "Others"
            else:
                others_node.current_event = "Others"
            others_node.hits = sum([node.hits for node in nodes[threshold - 1 :]])
            others_node.users = sum([node.users for node in nodes[threshold - 1 :]])
            nodes = nodes[:threshold]

        return nodes

    def create_exits_node(
        self, outflow_node: NodeSankey, hits: float, exits: bool = True
    ):
        exits_node = deepcopy(outflow_node)
        exits_node.hits = hits
        if exits:
            exits_node.current_event = "Exits"
        else:
            exits_node.previous_event = "Entrances"
        return exits_node

    def inflow_nodes_threshold(
        self, provider: IntegrationProvider, inflow_hits: int, outflow_hits: int
    ):
        return (
            5
            if (provider == IntegrationProvider.GOOGLE or (inflow_hits > outflow_hits))
            else 4
        )

    def outflow_nodes_threshold(
        self, provider: IntegrationProvider, inflow_hits: int, outflow_hits: int
    ):
        return (
            5
            if (provider != IntegrationProvider.GOOGLE and (inflow_hits < outflow_hits))
            else 4
        )

    def calculate_sankey_percentages(
        self,
        sankey_nodes: List[NodeSankey],
        inflow_hits: int,
        outflow_hits: int,
        inflow_users: int,
        outflow_users: int,
    ):
        for node in sankey_nodes:
            node.hits_percentage = float(
                "{:.2f}".format((node.hits * 100) / max(inflow_hits, outflow_hits))
                if max(inflow_hits, outflow_hits) != 0
                else 0
            )
            node.users_percentage = float(
                "{:.2f}".format((node.users * 100) / max(inflow_users, outflow_users))
                if max(inflow_users, outflow_users) != 0
                else 0
            )
        return sankey_nodes

    def postprocessed_sankey(
        self, sankey_nodes: List[NodeSankey], provider: IntegrationProvider
    ):
        inflow_nodes = [
            node for node in sankey_nodes if node.flow == SankeyDirection.INFLOW
        ]
        outflow_nodes = [
            node for node in sankey_nodes if node.flow == SankeyDirection.OUTFLOW
        ]

        inflow_hits = sum([node.hits for node in inflow_nodes])
        outflow_hits = sum([node.hits for node in outflow_nodes])
        inflow_users = sum([node.users for node in inflow_nodes])
        outflow_users = sum([node.users for node in outflow_nodes])

        inflow_nodes_threshold = self.inflow_nodes_threshold(
            provider=provider, inflow_hits=inflow_hits, outflow_hits=outflow_hits
        )
        outflow_nodes_threshold = self.outflow_nodes_threshold(
            provider=provider, inflow_hits=inflow_hits, outflow_hits=outflow_hits
        )
        if len(inflow_nodes) > inflow_nodes_threshold:
            inflow_nodes = self.create_others_node(inflow_nodes, inflow_nodes_threshold)
        if len(outflow_nodes) > outflow_nodes_threshold:
            outflow_nodes = self.create_others_node(
                outflow_nodes, outflow_nodes_threshold
            )

        # Temporary fix for sankey duplicate names
        for node in inflow_nodes:
            node.previous_event += " "

        if (len(outflow_nodes) > 0) and (inflow_hits > outflow_hits):
            outflow_nodes.append(
                self.create_exits_node(
                    outflow_nodes[0],
                    inflow_hits - outflow_hits,
                )
            )
        if (
            (len(inflow_nodes) > 0)
            and (inflow_hits < outflow_hits)
            and provider != IntegrationProvider.GOOGLE
        ):
            inflow_nodes.append(
                self.create_exits_node(
                    inflow_nodes[0],
                    outflow_hits - inflow_hits,
                    exits=False,
                )
            )
        sankey_nodes = inflow_nodes + outflow_nodes
        sankey_nodes = self.calculate_sankey_percentages(
            sankey_nodes=sankey_nodes,
            inflow_hits=inflow_hits,
            outflow_hits=outflow_hits,
            inflow_users=inflow_users,
            outflow_users=outflow_users,
        )
        return sankey_nodes

    async def get_node_sankey(
        self, datasource: DataSource, node: str, start_date: str, end_date: str
    ) -> list[NodeSankey]:
        if datasource.provider == IntegrationProvider.GOOGLE:
            start_date = dt.strptime(start_date, "%Y-%m-%d")
            end_date = dt.strptime(end_date, "%Y-%m-%d")
            pipeline = [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": datasource.id},
                            {"current_event": node},
                            {"date": {"$gte": start_date}},
                            {"date": {"$lte": end_date}},
                        ]
                    }
                },
                {
                    "$group": {
                        "_id": {"previous_event": "$previous_event"},
                        "node": {"$max": "$previous_event"},
                        "current_event": {"$max": "$current_event"},
                        "previous_event": {"$max": "$previous_event"},
                        "hits": {"$sum": "$hits"},
                        "users": {"$sum": "$users"},
                        "flow": {"$max": f"{SankeyDirection.INFLOW.value}"},
                        "hits_percentage": {"$max": 0},
                        "users_percentage": {"$max": 0},
                    }
                },
                {"$sort": {"hits": -1}},
                {
                    "$unionWith": {
                        "coll": "edges",
                        "pipeline": [
                            {
                                "$match": {
                                    "$and": [
                                        {"datasource_id": datasource.id},
                                        {"previous_event": node},
                                        {"date": {"$gte": start_date}},
                                        {"date": {"$lte": end_date}},
                                    ]
                                }
                            },
                            {
                                "$group": {
                                    "_id": {"current_event": "$current_event"},
                                    "node": {"$max": "$current_event"},
                                    "current_event": {"$max": "$current_event"},
                                    "previous_event": {"$max": "$previous_event"},
                                    "hits": {"$sum": "$hits"},
                                    "users": {"$sum": "$users"},
                                    "flow": {
                                        "$max": f"{SankeyDirection.OUTFLOW.value}"
                                    },
                                    "hits_percentage": {"$max": 0},
                                    "users_percentage": {"$max": 0},
                                }
                            },
                            {"$sort": {"hits": -1}},
                        ],
                    }
                },
            ]

            sankey_nodes = (
                await BaseEdge.find()
                .aggregate(pipeline, projection_model=NodeSankey)
                .to_list()
            )
        else:
            sankey_nodes = await self.edges.get_node_sankey(
                ds_id=str(datasource.id),
                event_name=node,
                start_date=start_date,
                end_date=end_date,
                app_id=str(datasource.app_id),
            )
            sankey_nodes = [
                NodeSankey(
                    flow=flow,
                    node=node,
                    current_event=curr_event,
                    previous_event=prev_event,
                    hits=hits,
                    users=users,
                    hits_percentage=0,
                    users_percentage=0,
                )
                for (flow, prev_event, curr_event, hits, users) in sankey_nodes
            ]

        return self.postprocessed_sankey(
            sankey_nodes=sankey_nodes, provider=datasource.provider
        )

    # Remove facet in-future, might cause performance issues.
    async def get_node_significance(
        self, datasource: DataSource, node: str, start_date: str, end_date: str
    ) -> list[NodeSignificance]:
        if datasource.provider == IntegrationProvider.GOOGLE:
            start_date = dt.strptime(start_date, "%Y-%m-%d")
            end_date = dt.strptime(end_date, "%Y-%m-%d")
            pipeline = [
                {
                    "$match": {
                        "$and": [
                            {"datasource_id": datasource.id},
                            {"date": {"$gte": start_date}},
                            {"date": {"$lte": end_date}},
                        ]
                    }
                },
                {
                    "$facet": {
                        "total_count": [
                            {
                                "$group": {
                                    "_id": {"_class_id": "$_class_id"},
                                    "hits": {"$sum": "$hits"},
                                }
                            }
                        ],
                        "current_node_count": [
                            {"$match": {"current_event": node}},
                            {
                                "$group": {
                                    "_id": {"event": "$current_event"},
                                    "hits": {"$sum": "$hits"},
                                }
                            },
                        ],
                        "previous_node_count": [
                            {"$match": {"previous_event": node}},
                            {
                                "$group": {
                                    "_id": {"event": "$previous_event"},
                                    "hits": {"$sum": "$hits"},
                                }
                            },
                        ],
                    }
                },
                {
                    "$project": {
                        "node": node,
                        "node_hits": {
                            "$ifNull": [
                                {"$max": "$current_node_count.hits"},
                                {"$max": "$previous_node_count.hits"},
                            ]
                        },
                        "total_hits": {"$max": "$total_count.hits"},
                    }
                },
            ]

            return (
                await BaseEdge.find()
                .aggregate(pipeline, projection_model=NodeSignificance)
                .to_list()
            )
        else:
            (
                (node_users, total_users, node_hits, total_hits),
            ) = await self.edges.get_node_significance(
                ds_id=str(datasource.id),
                event_name=node,
                start_date=start_date,
                end_date=end_date,
                app_id=str(datasource.app_id),
            )
            return [
                NodeSignificance(
                    node=node,
                    node_users=node_users,
                    total_users=total_users,
                    node_hits=node_hits,
                    total_hits=total_hits,
                )
            ]

    async def get_node_data(
        self, nodes: List, ds_id: str, days_ago: int
    ) -> List[AggregatedEdge]:
        pipeline = [
            {
                "$match": {
                    "datasource_id": PydanticObjectId(ds_id),
                    "current_event": {"$in": nodes},
                    "date": dt.strptime(
                        (dt.today() - timedelta(days=days_ago)).strftime("%Y-%m-%d"),
                        "%Y-%m-%d",
                    ),
                }
            },
            {
                "$group": {
                    "_id": {"current_event": "$current_event"},
                    "hits": {"$sum": "$hits"},
                    "users": {"$sum": "$users"},
                    "current_event": {"$max": "$current_event"},
                    "previous_event": {"$max": ""},
                }
            },
        ]

        return (
            await BaseEdge.find()
            .aggregate(pipeline, projection_model=AggregatedEdge)
            .to_list()
        )

    async def get_node_data_for_notification(
        self, notification: Notification, days_ago: int
    ):
        return await asyncio.gather(
            *[
                self.get_node_data(nodes, notification.datasource_id, days_ago=days_ago)
                for ratio_name, nodes in notification.variable_map.items()
            ]
        )

    async def get_node_data_for_notifications(
        self,
        notifications: List[Notification],
    ) -> List[NotificationNodeData]:
        node_data_for_notifications = (
            [
                NotificationNodeData(
                    name=notification.name,
                    notification_id=notification.id,
                    node_data=await self.get_node_data_for_notification(
                        notification, days_ago=1
                    ),
                    prev_day_node_data=await self.get_node_data_for_notification(
                        notification, days_ago=2
                    ),
                    threshold_type=NotificationThresholdType.PCT
                    if notification.pct_threshold_active
                    else NotificationThresholdType.ABSOLUTE,
                    threshold_value=notification.pct_threshold_values
                    if notification.pct_threshold_active
                    else notification.absolute_threshold_values,
                )
                for notification in notifications
            ]
            if notifications
            else []
        )

        return node_data_for_notifications
