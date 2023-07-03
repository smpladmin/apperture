from unittest.mock import MagicMock

from domain.apps.models import ClickHouseCredential
from repositories.clickhouse.datamart import DataMartRepo


class TestDataMartRepo:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = DataMartRepo(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
        self.table_name = "datamart-table"
        self.db_name = "test-db"
        self.query = "select event_name, user_id from events"
        self.repo.execute_query_for_restricted_client = MagicMock()
        self.credential = ClickHouseCredential(
            username="test-username",
            password="test-password",
            databasename="test-database",
        )

    def test_generate_create_table_query(self):
        assert self.repo.generate_create_table_query(
            query=self.query, table_name=self.table_name, db_name=self.db_name
        ) == (
            "CREATE TABLE test-db.datamart-table  ENGINE = MergeTree ORDER BY "
            "dummy_column_for_orderby AS SELECT *, 1 AS dummy_column_for_orderby from "
            "(select event_name, user_id from events)"
        )

    def test_create_table(self):
        self.repo.create_table(
            query=self.query,
            table_name=self.table_name,
            clickhouse_credential=self.credential,
        )
        self.repo.execute_query_for_restricted_client.assert_called_once_with(
            **{
                "password": "test-password",
                "query": "CREATE TABLE test-database.datamart-table  ENGINE = MergeTree ORDER "
                "BY dummy_column_for_orderby AS SELECT *, 1 AS "
                "dummy_column_for_orderby from (select event_name, user_id from "
                "events)",
                "username": "test-username",
            }
        )

    def test_drop_table(self):
        self.repo.drop_table(
            table_name=self.table_name, clickhouse_credential=self.credential
        )
        self.repo.execute_query_for_restricted_client.assert_called_once_with(
            **{
                "password": "test-password",
                "query": "DROP TABLE IF EXISTS test-database.datamart-table",
                "username": "test-username",
            }
        )
