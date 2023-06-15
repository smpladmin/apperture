from collections import namedtuple
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from beanie import PydanticObjectId

from domain.apps.models import App
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion
from domain.datasources.service import DataSourceService


class TestDataSourceService:
    def setup_method(self):
        DataSource.get_settings = MagicMock()
        App.get_settings = MagicMock()
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

        self.app = App(
            id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
            revision_id=None,
            created_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
            updated_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
            name="mixpanel1",
            user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
            shared_with=set(),
            clickhouse_credential=None,
        )
        self.datasource = DataSource(
            integration_id="636a1c61d715ca6baae65611",
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.APPERTURE,
            external_source_id="123",
            version=DataSourceVersion.DEFAULT,
        )
        self.service.get_datasources_for_app_id = AsyncMock(
            return_value=[self.datasource]
        )
        self.service.create_user_policy_for_all_datasources = MagicMock()

        DataSource.provider = MagicMock(return_value=IntegrationProvider.APPERTURE)
        DataSource.id = MagicMock(return_value=self.ds_id)
        DataSource.enabled = MagicMock(return_value=True)

    @pytest.mark.asyncio
    async def test_get_datasources_for_provider(self):
        await self.service.get_datasources_for_provider(
            provider=IntegrationProvider.APPERTURE
        )
        DataSource.find.assert_called_once()

    def test_create_row_policy_for_username(self):
        self.service.create_row_policy_for_username(
            username=self.username, datasource_id=self.ds_id
        )
        self.clickhouse_role.create_row_policy.assert_called_once_with(
            datasource_id="636a1c61d715ca6baae65611", username="test_user"
        )

    @pytest.mark.asyncio
    async def test_create_row_policy_for_datasources_by_app(self):
        await self.service.create_row_policy_for_datasources_by_app(
            app=self.app, username=self.username
        )
        self.service.get_datasources_for_app_id.assert_called_once_with(self.app.id)
        self.service.create_user_policy_for_all_datasources.assert_called_once_with(
            datasources=[self.datasource], username=self.username
        )
