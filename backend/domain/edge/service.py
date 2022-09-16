import datetime
from beanie import PydanticObjectId
from fastapi import Depends
from domain.common.models import IntegrationProvider
from domain.edge.models import Edge, AggregatedEdge
from mongo.mongo import Mongo


class EdgeService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo

    def build(
        self,
        datasource_id: str,
        provider: IntegrationProvider,
        previous_event: str,
        current_event: str,
        users: int,
        hits: int,
        date: datetime.datetime,
    ):
        return Edge(
            datasource_id=PydanticObjectId(datasource_id),
            provider=provider,
            previous_event=previous_event,
            current_event=current_event,
            users=users,
            hits=hits,
            date=date,
        )

    async def update_edges(self, edges: list[Edge], datasource_id: PydanticObjectId):
        for edge in edges:
            edge.updated_at = edge.created_at
        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await Edge.find(Edge.datasource_id == datasource_id).delete()
                await Edge.insert_many(edges)

    async def get_edges(self, datasource_id: str) -> list[Edge]:
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
            await Edge.find()
            .aggregate(pipeline, projection_model=AggregatedEdge)
            .to_list()
        )
