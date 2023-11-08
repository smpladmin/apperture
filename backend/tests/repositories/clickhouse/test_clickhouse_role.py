from collections import namedtuple
from unittest import mock
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from beanie import PydanticObjectId

from clickhouse.clickhouse_client_factory import ClickHouseClientFactory
from domain.apps.models import App
from repositories.clickhouse.clickhouse_role import ClickHouseRole


class TestRoleRepository:
    @classmethod
    def setup_method(self):
        self.clickhouse_role = ClickHouseRole()
        self.dsId = "65723993434637434"
        self.appId = PydanticObjectId("635ba034807ab86d8a2aadd9")
        self.username = "test_user"
        self.password = "test_password"
        self.databasename = "test_databse"
        self.create_user_query = f"CREATE USER {self.username} IDENTIFIED WITH plaintext_password BY '{self.password}'"
        self.grant_select_permission_query = (
            f"GRANT SELECT ON events TO {self.username}"
        )
        self.create_row_policy_query = f"CREATE ROW POLICY pol{self.dsId} ON default.events, default.clickstream USING datasource_id='{self.dsId}' TO {self.username}"
        self.create_database_query = f"CREATE DATABASE {self.databasename}"
        self.grant_permission_to_database_query = f"GRANT SHOW, SELECT, INSERT, ALTER, CREATE TABLE, CREATE VIEW, DROP TABLE, DROP VIEW, TRUNCATE ON {self.databasename}.* TO {self.username};"
        self.query = MagicMock()
        FindMock = namedtuple("FindMock", ["to_list"])
        App.id = MagicMock()
        App.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )

    @pytest.mark.asyncio
    async def test_create_user(self):
        mock_admin_client = MagicMock()
        mock_get_client = AsyncMock(return_value=mock_admin_client)
        with patch(
            "clickhouse.clickhouse_client_factory.ClickHouseClientFactory.get_client",
            mock_get_client,
        ):
            await self.clickhouse_role.create_user(
                username=self.username, password=self.password, app_id=self.appId
            )
            mock_get_client.assert_called_with(
                PydanticObjectId("635ba034807ab86d8a2aadd9")
            )
            mock_admin_client.admin_query.assert_called_with(
                query="CREATE USER test_user IDENTIFIED WITH sha256_password BY 'test_password'"
            )

    @pytest.mark.asyncio
    async def test_create_row_policy(self):
        mock_admin_client = MagicMock()
        mock_get_client = AsyncMock(return_value=mock_admin_client)
        with patch(
            "clickhouse.clickhouse_client_factory.ClickHouseClientFactory.get_client",
            mock_get_client,
        ):
            await self.clickhouse_role.create_row_policy(
                datasource_id=self.dsId, username=self.username, app_id=self.appId
            )
            mock_get_client.assert_called_with(
                PydanticObjectId("635ba034807ab86d8a2aadd9")
            )
            mock_admin_client.admin_query.assert_called_with(
                query=self.create_row_policy_query
            )

    @pytest.mark.asyncio
    async def test_grant_select_permission_to_user(self):
        mock_admin_client = MagicMock()
        mock_get_client = AsyncMock(return_value=mock_admin_client)
        with patch(
            "clickhouse.clickhouse_client_factory.ClickHouseClientFactory.get_client",
            mock_get_client,
        ):
            await self.clickhouse_role.grant_select_permission_to_user(
                username=self.username, app_id=self.appId
            )
            mock_get_client.assert_called_with(
                PydanticObjectId("635ba034807ab86d8a2aadd9")
            )
            mock_admin_client.admin_query.assert_has_calls(
                [
                    mock.call(query="GRANT SELECT ON events TO test_user;"),
                    mock.call(query="GRANT SELECT ON clickstream TO test_user;"),
                ]
            )

    @pytest.mark.asyncio
    async def test_grant_permission_to_database(self):
        mock_admin_client = MagicMock()
        mock_get_client = AsyncMock(return_value=mock_admin_client)
        with patch(
            "clickhouse.clickhouse_client_factory.ClickHouseClientFactory.get_client",
            mock_get_client,
        ):
            await self.clickhouse_role.grant_permission_to_database(
                database_name=self.databasename,
                username=self.username,
                app_id=self.appId,
            )
            mock_get_client.assert_called_with(
                PydanticObjectId("635ba034807ab86d8a2aadd9")
            )
            mock_admin_client.admin_query.assert_called_with(
                query=self.grant_permission_to_database_query
            )

    @pytest.mark.asyncio
    async def test_create_database(self):
        mock_admin_client = MagicMock()
        mock_get_client = AsyncMock(return_value=mock_admin_client)
        with patch(
            "clickhouse.clickhouse_client_factory.ClickHouseClientFactory.get_client",
            mock_get_client,
        ):
            await self.clickhouse_role.create_database_for_app(
                database_name=self.databasename, app_id=self.appId
            )
            mock_get_client.assert_called_with(
                PydanticObjectId("635ba034807ab86d8a2aadd9")
            )
            mock_admin_client.admin_query.assert_called_with(
                query=self.create_database_query
            )

    @pytest.mark.asyncio
    async def test_create_sample_tables(self):
        mock_admin_client = MagicMock()
        mock_get_client = AsyncMock(return_value=mock_admin_client)
        with patch(
            "clickhouse.clickhouse_client_factory.ClickHouseClientFactory.get_client",
            mock_get_client,
        ):
            await self.clickhouse_role.create_sample_tables(
                table_names=["trips", "stream"],
                database_name="test_app",
                app_id=self.appId,
            )
            mock_get_client.assert_called_with(
                PydanticObjectId("635ba034807ab86d8a2aadd9")
            )
            mock_admin_client.admin_query.assert_has_calls(
                [
                    mock.call(
                        query="CREATE TABLE test_app.trips ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM default.trips"
                    ),
                    mock.call(
                        query="CREATE TABLE test_app.stream ENGINE = MergeTree() ORDER BY tuple() AS SELECT * FROM default.stream"
                    ),
                ]
            )
