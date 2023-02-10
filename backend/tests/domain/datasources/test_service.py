from collections import namedtuple
from unittest.mock import MagicMock, AsyncMock

import pytest

from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource
from domain.datasources.service import DataSourceService


class TestDataSourceService:
    def setup_method(self):
        DataSource.get_settings = MagicMock()
        self.service = DataSourceService(auth_service=MagicMock())
        self.ds_id = "636a1c61d715ca6baae65611"
        FindMock = namedtuple("FindMock", ["to_list"])
        DataSource.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        DataSource.provider = MagicMock(return_value=IntegrationProvider.APPERTURE)

    @pytest.mark.asyncio
    async def test_get_datasources_for_provider(self):
        await self.service.get_datasources_for_provider(provider=IntegrationProvider.APPERTURE)
        DataSource.find.assert_called_once()
