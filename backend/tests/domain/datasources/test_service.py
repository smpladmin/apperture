import string
from collections import namedtuple
from unittest.mock import AsyncMock, MagicMock

import pytest

from domain.common.models import IntegrationProvider
from domain.datasources.models import ClickHouseCredential, DataSource
from domain.datasources.service import DataSourceService


class TestDataSourceService:
    def setup_method(self):
        DataSource.get_settings = MagicMock()
        self.clickhouse_role = MagicMock()
        self.service = DataSourceService(
            auth_service=MagicMock(), clickhouse_role=self.clickhouse_role
        )
        self.ds_id = "636a1c61d715ca6baae65611"
        FindMock = namedtuple("FindMock", ["to_list"])

        self.clickhouse_role.create_user = MagicMock()
        self.clickhouse_role.create_row_policy = MagicMock()
        self.clickhouse_role.grant_select_permission_to_user = MagicMock()

        self.username = "test_user"
        self.password = "test_password"
        DataSource.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        DataSource.provider = MagicMock(return_value=IntegrationProvider.APPERTURE)
        DataSource.id = MagicMock(return_value=self.ds_id)
        DataSource.enabled = MagicMock(return_value=True)

    @pytest.mark.asyncio
    async def test_get_datasources_for_provider(self):
        await self.service.get_datasources_for_provider(
            provider=IntegrationProvider.APPERTURE
        )
        DataSource.find.assert_called_once()

    def test_create_user_policy(self):
        self.service.create_user_policy(
            username=self.username, password=self.password, datasource_id=self.ds_id
        )

        self.clickhouse_role.create_user.assert_called_once_with(
            username="test_user", password="test_password"
        )
        self.clickhouse_role.create_row_policy.assert_called_once_with(
            datasource_id="636a1c61d715ca6baae65611", username="test_user"
        )
        self.clickhouse_role.grant_select_permission_to_user.assert_called_once_with(
            username="test_user"
        )

    @pytest.mark.asyncio
    async def test_create_clickhouse_credential_and_user_policy(self):
        FindMock = namedtuple("FindMock", ["update"])
        DataSource.find = MagicMock(
            return_value=FindMock(
                update=AsyncMock(),
            ),
        )
        self.service.random_value_generator = MagicMock(
            return_value="sdeweiwew33dssdsdds"
        )

        result = await self.service.create_clickhouse_credential_and_user_policy(
            datasource_id=self.ds_id
        )
        DataSource.find.assert_called_once()
        assert result == ClickHouseCredential(
            username="sdeweiwew33dssdsdds", password="sdeweiwew33dssdsdds"
        )
