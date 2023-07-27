from collections import namedtuple
from datetime import datetime
from unittest.mock import MagicMock, AsyncMock, ANY

import pytest
from beanie import PydanticObjectId

from domain.apps.models import ClickHouseCredential
from domain.datamart.models import DataMart
from domain.datamart.service import DataMartService
from domain.datasources.models import DataSource


class TestDataMartService:
    def setup_method(self):
        DataMart.get_settings = MagicMock()
        DataMart.find_one = AsyncMock()
        DataMart.update = AsyncMock()
        DataSource.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.string_utils = MagicMock()
        self.datamart_repo = MagicMock()
        self.service = DataMartService(
            mongo=self.mongo,
            string_utils=self.string_utils,
            datamart_repo=self.datamart_repo,
        )
        self.ds_id = "636a1c61d715ca6baae65611"
        self.app_id = "636a1c61d715ca6baae65612"
        self.user_id = "636a1c61d715ca6baae65611"
        self.name = "name"

        FindMock = namedtuple("FindMock", ["to_list"])
        DataMart.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        DataMart.app_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        DataMart.datasource_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.datamart_obj = DataMart(
            datasource_id=self.ds_id,
            app_id=self.app_id,
            user_id=self.user_id,
            name=self.name,
            query="select event_name, user_id from events",
            table_name="name",
            last_refreshed=datetime(2022, 11, 24, 0, 0),
            enabled=True,
        )

        FindOneMock = namedtuple("FindOneMock", ["update"])
        self.update_mock = AsyncMock()
        DataMart.find_one = MagicMock(return_value=FindOneMock(update=self.update_mock))
        DataMart.get = AsyncMock()
        DataMart.insert = AsyncMock()
        DataMart.id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        DataMart.enabled = True
        self.service.datamart_repo.create_table = MagicMock()
        self.service.datamart_repo.drop_table = MagicMock()
        self.service.string_utils.extract_tablename_from_filename = MagicMock(
            return_value="name"
        )
        self.clickhouse_credential = ClickHouseCredential(
            username="test-username",
            password="test-password",
            databasename="test-database",
        )

    def test_build_datamart(self):
        datamart = self.service.build_datamart_table(
            datasource_id=PydanticObjectId(self.ds_id),
            app_id=PydanticObjectId(self.app_id),
            user_id=self.user_id,
            name=self.name,
            query="select event_name, user_id from events",
        )

        assert datamart.dict() == {
            "app_id": PydanticObjectId("636a1c61d715ca6baae65612"),
            "created_at": ANY,
            "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "enabled": True,
            "id": None,
            "last_refreshed": ANY,
            "name": "name",
            "table_name": "name",
            "query": "select event_name, user_id from events",
            "revision_id": None,
            "updated_at": None,
            "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        }

    @pytest.mark.asyncio
    async def test_update_datamart(self):
        await self.service.update_datamart_table(
            table_id=self.ds_id,
            new_table=self.datamart_obj,
            clickhouse_credential=self.clickhouse_credential,
        )
        DataMart.find.assert_called_once_with(
            False,
        )
        self.update_mock.assert_called_once_with(
            {
                "$set": {
                    "app_id": PydanticObjectId("636a1c61d715ca6baae65612"),
                    "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                    "enabled": True,
                    "last_refreshed": ANY,
                    "name": "name",
                    "table_name": "name",
                    "query": "select event_name, user_id from events",
                    "revision_id": None,
                    "updated_at": ANY,
                    "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                }
            },
        )
        self.service.datamart_repo.create_table.assert_called_once_with(
            **{
                "clickhouse_credential": ClickHouseCredential(
                    username="test-username",
                    password="test-password",
                    databasename="test-database",
                ),
                "query": "select event_name, user_id from events",
                "table_name": ANY,
            }
        )
        self.service.datamart_repo.drop_table.assert_called_once_with(
            **{
                "clickhouse_credential": ClickHouseCredential(
                    username="test-username",
                    password="test-password",
                    databasename="test-database",
                ),
                "table_name": ANY,
            }
        )

    @pytest.mark.asyncio
    async def test_get_datamarts_for_apps(self):
        await self.service.get_datamart_tables_for_app_id(
            app_id=PydanticObjectId(self.app_id),
        )
        DataMart.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_datamart(self):
        await self.service.delete_datamart_table(
            datamart_id="6384a65e0a397236d9de236a",
            table_name="dUKQaHtqxM",
            clickhouse_credential=self.clickhouse_credential,
        )
        DataMart.find_one.assert_called_once()
        self.service.datamart_repo.drop_table.assert_called_once_with(
            **{
                "clickhouse_credential": ClickHouseCredential(
                    username="test-username",
                    password="test-password",
                    databasename="test-database",
                ),
                "table_name": "dUKQaHtqxM",
            }
        )
        self.update_mock.assert_called_once_with({"$set": {"enabled": False}})

    @pytest.mark.asyncio
    async def test_get_datamart(self):
        await self.service.get_datamart_table(id="6384a65e0a397236d9de236a")
        DataMart.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_datamart(self):
        await self.service.create_datamart_table(
            table=self.datamart_obj, clickhouse_credential=self.clickhouse_credential
        )
        self.service.datamart_repo.create_table.assert_called_once_with(
            **{
                "clickhouse_credential": ClickHouseCredential(
                    username="test-username",
                    password="test-password",
                    databasename="test-database",
                ),
                "query": "select event_name, user_id from events",
                "table_name": "name",
            }
        )
        DataMart.insert.assert_called_once()

    @pytest.mark.asyncio
    async def test_refresh_datamart_table(self):
        await self.service.refresh_datamart_table(
            datamart_id=self.ds_id,
            clickhouse_credential=self.clickhouse_credential,
        )
        DataMart.find.assert_called_once_with(
            False,
        )
        self.update_mock.assert_called_once_with(
            {
                "$set": {
                    "last_refreshed": ANY,
                }
            },
        )
        self.service.datamart_repo.create_table.assert_called_once_with(
            **{
                "clickhouse_credential": ClickHouseCredential(
                    username="test-username",
                    password="test-password",
                    databasename="test-database",
                ),
                "query": ANY,
                "table_name": ANY,
            }
        )
        self.service.datamart_repo.drop_table.assert_called_once_with(
            **{
                "clickhouse_credential": ClickHouseCredential(
                    username="test-username",
                    password="test-password",
                    databasename="test-database",
                ),
                "table_name": ANY,
            }
        )

    @pytest.mark.asyncio
    async def test_get_all_apps_with_datamarts(self):
        await self.service.get_all_apps_with_datamarts()
        DataMart.find.assert_called_once()
