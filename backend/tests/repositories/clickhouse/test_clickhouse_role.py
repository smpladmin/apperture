from unittest.mock import MagicMock
from unittest import mock

from repositories.clickhouse.clickhouse_role import ClickHouseRole


class TestRoleRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        self.clickhouse_role = ClickHouseRole(clickhouse=self.clickhouse)
        self.dsId = "65723993434637434"
        self.username = "test_user"
        self.password = "test_password"
        self.databasename = "test_databse"
        self.create_user_query = f"CREATE USER {self.username} IDENTIFIED WITH plaintext_password BY '{self.password}'"
        self.grant_select_permission_query = (
            f"GRANT SELECT ON events TO {self.username}"
        )
        self.create_row_policy_query = f"CREATE ROW POLICY pol{self.dsId} ON default.events, default.clickstream USING datasource_id='{self.dsId}' TO {self.username}"
        self.create_database_query = f"CREATE DATABASE {self.databasename}"
        self.grant_permission_to_database_query = f"GRANT SHOW, SELECT, INSERT, ALTER, CREATE TABLE, CREATE VIEW, DROP TABLE, DROP VIEW, UNDROP TABLE, TRUNCATE ON {self.databasename}.* TO {self.username};"
        self.query = MagicMock()
        self.clickhouse.admin = MagicMock(return_value=self.query)

    def test_create_user(self):
        self.clickhouse_role.create_user(username=self.username, password=self.password)
        self.clickhouse.admin.query.assert_called_with(query=self.create_user_query)

    def test_create_row_policy(self):
        self.clickhouse_role.create_row_policy(
            datasource_id=self.dsId, username=self.username
        )
        self.clickhouse.admin.query.assert_called_with(
            query=self.create_row_policy_query
        )

    def test_grant_select_permission_to_user(self):
        self.clickhouse_role.grant_select_permission_to_user(username=self.username)
        self.clickhouse.admin.query.assert_has_calls(
            [
                mock.call(query="GRANT SELECT ON events TO test_user;"),
                mock.call(query="GRANT SELECT ON clickstream TO test_user;"),
            ]
        )

    def test_grant_permission_to_database(self):
        self.clickhouse_role.grant_permission_to_database(
            database_name=self.databasename, username=self.username
        )
        self.clickhouse.admin.query.assert_called_with(
            query=self.grant_permission_to_database_query
        )

    def test_create_database(self):
        self.clickhouse_role.create_database_for_app(database_name=self.databasename)
        self.clickhouse.admin.query.assert_called_with(query=self.create_database_query)

    def test_create_sample_tables(self):
        self.clickhouse_role.create_sample_tables(
            table_names=["trips", "stream"], database_name="test_app"
        )
        self.clickhouse.admin.query.assert_has_calls(
            [
                mock.call(
                    query="CREATE TABLE test_app.trips ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM default.trips"
                ),
                mock.call(
                    query="CREATE TABLE test_app.stream ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM default.stream"
                ),
            ]
        )
