from datetime import datetime
from typing import List

from beanie import PydanticObjectId
from fastapi import Depends

from domain.apps.models import ClickHouseCredential
from domain.common.random_string_utils import StringUtils
from domain.datamart.models import DataMart
from mongo import Mongo
from repositories.clickhouse.clickhouse_role import ClickHouseRole
from repositories.clickhouse.datamart import DataMartRepo


class DataMartService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        datamart_repo: DataMartRepo = Depends(),
        clickhouse_role: ClickHouseRole = Depends(),
        string_utils: StringUtils = Depends(),
    ):
        self.mongo = mongo
        self.datamart_repo = datamart_repo
        self.clickhouse_role = clickhouse_role
        self.string_utils = string_utils

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
            table_name=self.string_utils.generate_random_value(length=16),
            query=query,
            last_refreshed=now,
        )

    async def create_datamart_table(
        self, table: DataMart, clickhouse_credential: ClickHouseCredential
    ):
        table.updated_at = table.created_at
        self.datamart_repo.create_table(
            query=table.query,
            table_name=table.table_name,
            clickhouse_credential=clickhouse_credential,
        )
        await DataMart.insert(table)

    async def update_datamart_table(
        self,
        table_id: str,
        new_table: DataMart,
        clickhouse_credential: ClickHouseCredential,
    ):
        to_update = new_table.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update.pop("table_name")
        to_update["updated_at"] = datetime.utcnow()

        existing_table = (
            await DataMart.find(
                DataMart.id == PydanticObjectId(table_id),
            ).to_list()
        )[0]
        self.datamart_repo.drop_table(
            table_name=existing_table.table_name,
            clickhouse_credential=clickhouse_credential,
        )
        self.datamart_repo.create_table(
            query=new_table.query,
            table_name=existing_table.table_name,
            clickhouse_credential=clickhouse_credential,
        )
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

    async def delete_datamart_table(
        self,
        datamart_id: str,
        table_name: str,
        clickhouse_credential: ClickHouseCredential,
    ):
        self.datamart_repo.drop_table(
            table_name=table_name, clickhouse_credential=clickhouse_credential
        )

        await DataMart.find_one(
            DataMart.id == PydanticObjectId(datamart_id),
        ).update({"$set": {"enabled": False}})
        return
