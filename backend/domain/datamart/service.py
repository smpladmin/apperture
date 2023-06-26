from datetime import datetime
from typing import List

from beanie import PydanticObjectId
from fastapi import Depends

from domain.datamart.models import DataMart
from mongo import Mongo


class DataMartService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
    ):
        self.mongo = mongo

    def build_datamart_table(
        self,
        datasource_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: str,
        name: str,
        query: str,
    ) -> DataMart:
        now = datetime.now()
        return DataMart(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            query=query,
            last_refreshed=now,
        )

    async def create_datamart_table(self, table: DataMart):
        table.updated_at = table.created_at
        await DataMart.insert(table)

    async def update_datamart_table(self, table_id: str, new_table: DataMart):
        to_update = new_table.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await DataMart.find_one(
            DataMart.id == PydanticObjectId(table_id),
        ).update({"$set": to_update})

    async def get_datamart_table(self, id: str) -> DataMart:
        return await DataMart.get(PydanticObjectId(id))

    async def get_datamart_tables_for_app_id(
        self, app_id: PydanticObjectId
    ) -> List[DataMart]:
        return await DataMart.find(
            DataMart.app_id == app_id,
            DataMart.enabled != False,
        ).to_list()

    async def delete_datamart_table(self, datamart_id: str):
        await DataMart.find_one(
            DataMart.id == PydanticObjectId(datamart_id),
        ).update({"$set": {"enabled": False}})
        return
