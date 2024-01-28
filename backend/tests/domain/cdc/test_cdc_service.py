import asyncio
from collections import namedtuple
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from beanie import PydanticObjectId

import pytest
from domain.apps.models import App, ClickHouseCredential


from domain.cdc.service import CDCService


class TestCdcService:
    def setup_method(self):
        self.settings = MagicMock()
        App.get_settings = MagicMock()
        self.service = CDCService()
        self.clickhouse_credential = ClickHouseCredential(
            username="test_username",
            password="test_password",
            databasename="test_database",
        )

        self.app = App(
            id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
            revision_id=None,
            created_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
            updated_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
            name="wiom",
            user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
            shared_with=set(),
            clickhouse_credential=self.clickhouse_credential,
        )
        self.result_set = [(1706446658060,)]
        self.config = {
            "connector.class": "io.debezium.connector.sqlserver.SqlServerConnector",
            "database.encrypt": "false",
            "database.user": "user",
            "database.names": "shard_01",
            "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
            "database.port": "1433",
            "topic.prefix": "cdc_65b658c7d85b17e8",
            "schema.history.internal.kafka.topic": "schemahistory.cdc_65b658c7d85b17e8a407cb54",
            "database.hostname": "localhost",
            "database.password": "Test@1234",
            "name": "cdc_65b658c7d85b17e8",
            "table.include.list": "dbo.t_account, dbo.test_1",
            "snapshot.mode": "initial",
            "snapshot.lock.timeout.ms": "100000",
        }

    @pytest.mark.asyncio
    async def test_get_last_ingested_date_str(self):
        with patch(
            "clickhouse.clickhouse_client_factory.ClickHouseClientFactory.get_client"
        ) as mock_get_client:
            mock_client = AsyncMock()
            mock_client.query = MagicMock(
                return_value=MagicMock(result_set=[(1706446658060,)])
            )
            mock_get_client.return_value = mock_client

            assert (
                await self.service.get_last_ingested_date_str(
                    column="added_time",
                    table="t_account",
                    database="test",
                    app=self.app,
                )
                == "2024-01-28"
            )

            # in case of empty date
            mock_client.query = MagicMock(return_value=MagicMock(result_set=[]))
            assert (
                await self.service.get_last_ingested_date_str(
                    column="added_time",
                    table="t_account",
                    database="test",
                    app=self.app,
                )
                == "2023-01-01"
            )

    @pytest.mark.asyncio
    async def test_get_snapshot_override_query(self):
        self.service.get_last_ingested_date_str = AsyncMock(return_value="2024-01-28")
        assert await self.service.get_snapshot_override_query(
            database="test_db",
            table="test_table",
            app=self.app,
        ) == {
            "snapshot.select.statement.overrides.test_db.test_table": "select * from test_db.dbo.test_table where toDate(added_time) >= '2024-01-28'"
        }

    @pytest.mark.asyncio
    async def test_generate_update_connector_config_to_resume(self):
        self.service.get_snapshot_override_query = AsyncMock(
            return_value={
                "snapshot.select.statement.overrides.your_database.t_account": "select * from your_database.dbo.t_account where toDate(added_time) >= '2022-01-01'"
            }
        )

        assert await self.service.generate_update_connector_config_to_resume(
            config=self.config, app=self.app
        ) == {
            "connector.class": "io.debezium.connector.sqlserver.SqlServerConnector",
            "database.encrypt": "false",
            "database.user": "user",
            "database.names": "shard_01",
            "schema.history.internal.kafka.bootstrap.servers": "kafka:9092",
            "database.port": "1433",
            "topic.prefix": "cdc_65b658c7d85b17e8",
            "schema.history.internal.kafka.topic": "schemahistory.cdc_65b658c7d85b17e8a407cb54",
            "database.hostname": "localhost",
            "database.password": "Test@1234",
            "name": "cdc_65b658c7d85b17e8",
            "table.include.list": "dbo.t_account, dbo.test_1",
            "snapshot.mode": "initial",
            "snapshot.lock.timeout.ms": "100000",
            "snapshot.select.statement.overrides.your_database.t_account": "select * from your_database.dbo.t_account where toDate(added_time) >= '2022-01-01'",
            "snapshot.select.statement.overrides": "t_account, ",
        }
