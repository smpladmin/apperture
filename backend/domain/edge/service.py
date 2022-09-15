from beanie import PydanticObjectId
from fastapi import Depends
from domain.common.models import IntegrationProvider
from domain.edge.models import Edge
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
        date: str,
        rolled_previous_event: str,
        rolled_current_event: str,
    ):
        return Edge(
            datasource_id=PydanticObjectId(datasource_id),
            provider=provider,
            previous_event=previous_event,
            current_event=current_event,
            users=users,
            hits=hits,
            date=date,
            rolled_previous_event=rolled_previous_event,
            rolled_current_event=rolled_current_event,
        )

    async def update_edges(self, edges: list[Edge], datasource_id: PydanticObjectId):
        for edge in edges:
            edge.updated_at = edge.created_at
        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await Edge.find(Edge.datasource_id == datasource_id).delete()
                await Edge.insert_many(edges)

    async def get_edges(self, datasource_id: str) -> list[Edge]:
        return await Edge.find(
            Edge.datasource_id == PydanticObjectId(datasource_id)
        ).to_list()
