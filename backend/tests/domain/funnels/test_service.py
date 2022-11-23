import pytest
from datetime import datetime
from unittest.mock import ANY
from collections import namedtuple
from beanie import PydanticObjectId
from unittest.mock import MagicMock, AsyncMock

from tests.utils import filter_response
from domain.datasources.models import DataSource
from domain.funnels.service import FunnelsService
from domain.common.models import IntegrationProvider
from domain.funnels.models import (
    FunnelStep,
    Funnel,
    ComputedFunnelStep,
    ComputedFunnel,
    FunnelTrendsData,
    EventFilters,
)


class TestFunnelService:
    def setup_method(self):
        Funnel.get_settings = MagicMock()
        Funnel.find_one = AsyncMock()
        Funnel.update = AsyncMock()
        DataSource.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.funnels = MagicMock()
        self.service = FunnelsService(mongo=self.mongo, funnels=self.funnels)
        self.ds_id = "636a1c61d715ca6baae65611"
        self.provider = IntegrationProvider.MIXPANEL
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
        self.computed_steps = [
            ComputedFunnelStep(event="Login", users=100, conversion=100.0),
            ComputedFunnelStep(event="Chapter Click", users=40, conversion=40.0),
        ]
        self.computed_funnel = ComputedFunnel(
            datasource_id=self.ds_id,
            steps=self.funnel_steps,
            name=self.name,
            random_sequence=False,
            computed_funnel=self.computed_steps,
        )
        self.conversion_data = [
            (1, 2022, 0.51),
            (2, 2022, 0.55),
            (3, 2022, 0.53),
        ]
        self.funnel_trends_data = [
            FunnelTrendsData(
                conversion=data[2],
                start_date=datetime.strptime(f"{data[1]}-{data[0]}-1", "%Y-%W-%w"),
                end_date=datetime.strptime(f"{data[1]}-{data[0]}-0", "%Y-%W-%w"),
            )
            for data in self.conversion_data
        ]
        self.funnels.get_users_count = MagicMock()
        self.funnels.get_users_count.return_value = [(100, 40)]
        self.funnels.get_conversion_trend = MagicMock()
        self.funnels.get_conversion_trend.return_value = self.conversion_data
        FindOneMock = namedtuple("FindOneMock", ["update"])
        self.update_mock = AsyncMock()
        Funnel.find_one = MagicMock(return_value=FindOneMock(update=self.update_mock))
        Funnel.id = MagicMock(return_value=PydanticObjectId(self.ds_id))

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
        assert self.computed_steps == await self.service.compute_funnel(
            ds_id=self.ds_id, steps=self.funnel_steps
        )

    @pytest.mark.asyncio
    async def test_get_computed_funnel(self):
        assert self.computed_funnel == await self.service.get_computed_funnel(
            funnel=self.funnel
        )

    @pytest.mark.asyncio
    async def test_update_funnel(self):
        await self.service.update_funnel(funnel_id=self.ds_id, new_funnel=self.funnel)

        self.update_mock.assert_called_once_with(
            {
                "$set": {
                    "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                    "name": "name",
                    "random_sequence": False,
                    "revision_id": ANY,
                    "steps": [
                        {
                            "event": "Login",
                            "filters": [{"property": "mp_country_code", "value": "IN"}],
                        },
                        {"event": "Chapter Click", "filters": None},
                    ],
                    "updated_at": ANY,
                    "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                }
            },
        )

    @pytest.mark.asyncio
    async def test_get_funnel_trends(self):
        assert (
            await self.service.get_funnel_trends(funnel=self.funnel)
            == self.funnel_trends_data
        )

        self.funnels.get_conversion_trend.assert_called_once_with(
            **{
                "ds_id": "636a1c61d715ca6baae65611",
                "steps": [
                    FunnelStep(
                        event="Login",
                        filters=[EventFilters(property="mp_country_code", value="IN")],
                    ),
                    FunnelStep(event="Chapter Click", filters=None),
                ],
            }
        )
