import asyncio

import pytest
from unittest.mock import MagicMock

from tests.utils import filter_response
from domain.funnels.service import FunnelsService
from domain.funnels.models import FunnelStep, Funnel, ComputedFunnelStep
from domain.datasources.models import DataSource, DataSourceVersion
from domain.common.models import IntegrationProvider


class TestFunnelService:
    def setup_method(self):
        Funnel.get_settings = MagicMock()
        DataSource.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.funnels = MagicMock()
        self.service = FunnelsService()
        self.ds_id = "636a1c61d715ca6baae65611"
        self.user_id = "636a1c61d715ca6baae65611"
        self.name = "name"
        self.funnel_steps = [
            FunnelStep(
                event="Login", filters=[{"property": "mp_country_code", "value": "IN"}]
            ),
            FunnelStep(event="Chapter Click", filters=None),
        ]
        self.funnel = Funnel(
            datasource_id=self.ds_id,
            user_id=self.user_id,
            name=self.name,
            steps=self.funnel_steps,
            random_sequence=False,
        )
        self.datasource = DataSource(
            integration_id="636a1c61d715ca6baae65611",
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.MIXPANEL,
            external_source_id="123",
            version=DataSourceVersion.DEFAULT,
        )
        self.computed_funnel = [
            ComputedFunnelStep(event_name="Login", users=100, conversion=100.0),
            ComputedFunnelStep(event_name="Chapter Click", users=40, conversion=40.0),
        ]

    def test_build_funnel(self):

        funnel = self.service.build_funnel(
            datasourceId=self.ds_id,
            userId=self.user_id,
            name=self.name,
            steps=self.funnel_steps,
            randomSequence=False,
        )

        assert filter_response(funnel.dict()) == filter_response(self.funnel.dict())

    @pytest.mark.parametrize(
        "n, data, conversion",
        [(1, (100, 40, 10), 40), (0, (100, 40, 10), 100), (1, (0, 40, 10), 0)],
    )
    def test_compute_conversion(self, n, data, conversion):
        assert conversion == self.service.compute_conversion(n, data)

    @pytest.mark.asyncio
    async def test_compute_funnel(self):
        self.service.ds_service.get_datasource = MagicMock()
        datasource_future = asyncio.Future()
        datasource_future.set_result(self.datasource)
        self.service.ds_service.get_datasource.return_value = datasource_future
        self.service.funnels.get_events_data = MagicMock()
        self.service.funnels.get_events_data.return_value = [(100, 40)]
        assert self.computed_funnel == await self.service.compute_funnel(
            ds_id=self.ds_id, steps=self.funnel_steps
        )
