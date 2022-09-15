from beanie import PydanticObjectId
from fastapi import Depends
from domain.common.models import IntegrationProvider
from domain.cleaned_data.models import CleanedData
from mongo.mongo import Mongo


class CleanedDataService:
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
    ):
        return CleanedData(
            datasource_id=PydanticObjectId(datasource_id),
            provider=provider,
            previous_event=previous_event,
            current_event=current_event,
            users=users,
            hits=hits,
            date=date,
        )

    async def update_data(self, rows: list[CleanedData], datasource_id: PydanticObjectId):
        for row in rows:
            row.updated_at = row.created_at
        async with await self.mongo.client.start_session() as s:
            async with s.start_transaction():
                await CleanedData.find(CleanedData.datasource_id == datasource_id).delete()
                await CleanedData.insert_many(rows)

    async def get_data(self, datasource_id: str) -> list[CleanedData]:
        return await CleanedData.find(
            CleanedData.datasource_id == PydanticObjectId(datasource_id)
        ).to_list()
