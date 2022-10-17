import asyncio
from copy import deepcopy
from typing import List
from datetime import datetime as dt
from datetime import timedelta
from typing import Union
from beanie import PydanticObjectId
from fastapi import Depends
from domain.common.models import IntegrationProvider
from domain.edge.models import (
    Edge,
    BaseEdge,
    RichEdge,
    AggregatedEdge,
    NodeTrend,
    NodeSankey,
    NodeSignificance,
    NotificationNodeData,
)
from domain.notifications.models import (
    Notification,
    NotificationType,
    NotificationThresholdType,
)
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

    async def get_edges(
        self, datasource_id: str, start_date: str, end_date: str
    ) -> list[AggregatedEdge]:
        start_date = dt.strptime(start_date, "%Y-%m-%d")
        end_date = dt.strptime(end_date, "%Y-%m-%d")
        minimum_edge_count = 100
        pipeline = [
            {
                "$match": {
                    "$and": [
                        {"datasource_id": PydanticObjectId(datasource_id)},
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

    async def get_node_trends(
        self,
        datasource_id: str,
        node: str,
        trend_type: str,
        start_date: str,
        end_date: str,
    ) -> list[NodeTrend]:
        start_date = dt.strptime(start_date, "%Y-%m-%d")
        end_date = dt.strptime(end_date, "%Y-%m-%d")
        pipeline = [
            {
                "$match": {
                    "$and": [
                        {"datasource_id": PydanticObjectId(datasource_id)},
                        {"current_event": node},
                        {"date": {"$gte": start_date}},
                        {"date": {"$lte": end_date}},
                    ]
                }
            },
            {
                "$group": {
                    "_id": {
                        "current_event": "$current_event",
                        "{}".format(trend_type): {"${}".format(trend_type): "$date"},
                        "year": {"$year": "$date"},
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
            {"$sort": {"year": 1, "{}".format(trend_type): 1}},
        ]

        if trend_type == "date":
            pipeline[1]["$group"]["_id"] = {
                "current_event": "$current_event",
                "date": "$date",
            }

        return (
            await BaseEdge.find()
            .aggregate(pipeline, projection_model=NodeTrend)
            .to_list()
        )

    def create_others_node(self, nodes, threshold):
        if len(nodes) > threshold:
            others_node = nodes[threshold - 1]
            others_node.node = "Others"
            if nodes[0].flow == "inflow":
                others_node.previous_event = "Others"
            else:
                others_node.current_event = "Others"
            others_node.hits = sum([node.hits for node in nodes[threshold - 1 :]])
            others_node.users = sum([node.users for node in nodes[threshold - 1 :]])
            nodes = nodes[:threshold]

        return nodes

    def create_exits_node(self, outflow_node, hits, users):
        exits_node = deepcopy(outflow_node)
        exits_node.users = users
        exits_node.hits = hits
        exits_node.node = "Exits"
        exits_node.current_event = "Exits"
        return exits_node

    async def get_node_sankey(
        self, datasource_id: str, node: str, start_date: str, end_date: str
    ) -> list[NodeSankey]:
        start_date = dt.strptime(start_date, "%Y-%m-%d")
        end_date = dt.strptime(end_date, "%Y-%m-%d")
        pipeline = [
            {
                "$match": {
                    "$and": [
                        {"datasource_id": PydanticObjectId(datasource_id)},
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
                    "flow": {"$max": "inflow"},
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
                                    {"datasource_id": PydanticObjectId(datasource_id)},
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
                                "flow": {"$max": "outflow"},
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
        inflow_nodes = [node for node in sankey_nodes if node.flow == "inflow"]
        outflow_nodes = [node for node in sankey_nodes if node.flow == "outflow"]
        if len(inflow_nodes) > 5:
            inflow_nodes = self.create_others_node(inflow_nodes, 5)
        if len(outflow_nodes) > 4:
            outflow_nodes = self.create_others_node(outflow_nodes, 4)

        # Temporary fix for sankey duplicate names
        for node in inflow_nodes:
            node.previous_event += " "

        inflow_hits = sum([node.hits for node in inflow_nodes])
        outflow_hits = sum([node.hits for node in outflow_nodes])
        inflow_users = sum([node.users for node in inflow_nodes])
        outflow_users = sum([node.users for node in outflow_nodes])
        if (len(outflow_nodes) > 0) and (inflow_hits > outflow_hits):
            outflow_nodes.append(
                self.create_exits_node(
                    outflow_nodes[0],
                    inflow_hits - outflow_hits,
                    inflow_users - outflow_users,
                )
            )
        sankey_nodes = inflow_nodes + outflow_nodes
        for node in sankey_nodes:
            node.hits_percentage = float(
                "{:.2f}".format((node.hits * 100) / max(inflow_hits, outflow_hits))
            )
            # Placeholder for now
            node.users_percentage = 0

        return sankey_nodes

    # Remove facet in-future, might cause performance issues.
    async def get_node_significance(
        self, datasource_id: str, node: str, start_date: str, end_date: str
    ) -> list[NodeSignificance]:
        start_date = dt.strptime(start_date, "%Y-%m-%d")
        end_date = dt.strptime(end_date, "%Y-%m-%d")
        pipeline = [
            {
                "$match": {
                    "$and": [
                        {"datasource_id": PydanticObjectId(datasource_id)},
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
    ) -> [NotificationNodeData]:

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
