from unittest.mock import AsyncMock, MagicMock
import pytest
from domain.apps.models import ClickHouseCredential
from repositories.clickhouse.datamart import DataMartRepo


class TestDataMartRepo:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = DataMartRepo(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
        self.app_id = "test-app-id"
        self.table_name = "datamart-table"
        self.db_name = "test-db"
        self.query = "select event_name, user_id from events"
        self.repo.execute_query_for_app_restricted_clients = AsyncMock()
        self.credential = ClickHouseCredential(
            username="test-username",
            password="test-password",
            databasename="test-database",
        )

    def test_generate_create_table_query(self):
        assert self.repo.generate_create_table_query(
            query=self.query, table_name=self.table_name, db_name=self.db_name
        ) == (
            "CREATE TABLE test-db.datamart-table  ENGINE = MergeTree ORDER BY tuple() AS "
            "select event_name, user_id from events"
        )

    @pytest.mark.asyncio
    async def test_create_table(self):
        await self.repo.create_table(
            query=self.query,
            table_name=self.table_name,
            clickhouse_credential=self.credential,
            app_id=self.app_id,
        )
        self.repo.execute_query_for_app_restricted_clients.assert_called_with(
            **{
                "query": "CREATE TABLE test-database.datamart-table  ENGINE = MergeTree ORDER "
                "BY tuple() AS select event_name, user_id from events",
                "app_id": "test-app-id",
            }
        )

    @pytest.mark.asyncio
    async def test_drop_table(self):
        await self.repo.drop_table(
            table_name=self.table_name,
            clickhouse_credential=self.credential,
            app_id=self.app_id,
        )
        self.repo.execute_query_for_app_restricted_clients.assert_called_once_with(
            **{
                "query": "DROP TABLE IF EXISTS test-database.datamart-table",
                "app_id": "test-app-id",
            }
        )

    @pytest.mark.asyncio
    async def test_rename_table(self):
        await self.repo.rename_table(
            old_table_name="old_table",
            new_table_name="new_table",
            database=self.credential.databasename,
            app_id=self.app_id,
        )
        self.repo.execute_query_for_app_restricted_clients.assert_called_once_with(
            **{
                "query": "RENAME TABLE test-database.old_table TO test-database.new_table",
                "app_id": "test-app-id",
            }
        )
