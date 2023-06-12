from unittest.mock import MagicMock

from repositories.clickhouse.clickhouse_role import ClickHouseRole


class TestRoleRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        self.clickhouse_role = ClickHouseRole(clickhouse=self.clickhouse)
        self.dsId = "65723993434637434"
        self.username = "test_user"
        self.password = "test_password"
        self.create_user_query = f"CREATE USER {self.username} IDENTIFIED WITH plaintext_password BY '{self.password}'"
        self.grant_select_permission_query = (
            f"GRANT SELECT ON events TO {self.username}"
        )
        self.create_row_policy_query = f"CREATE ROW POLICY pol{self.dsId} ON events USING datasource_id='{self.dsId}' TO {self.username}"
        self.query = MagicMock()
        self.clickhouse.admin = MagicMock(return_value=self.query)

    def test_create_user(self):
        self.clickhouse_role.create_user(username=self.username, password=self.password)
        self.clickhouse.admin.query.assert_called_with(query=self.create_user_query)

    def test_grant_select_permission_to_user(self):
        self.clickhouse_role.grant_select_permission_to_user(username=self.username)
        self.clickhouse.admin.query.assert_called_with(
            query=self.grant_select_permission_query
        )

    def test_create_row_policy(self):
        self.clickhouse_role.create_row_policy(
            datasource_id=self.dsId, username=self.username
        )
        self.clickhouse.admin.query.assert_called_with(
            query=self.create_row_policy_query
        )
