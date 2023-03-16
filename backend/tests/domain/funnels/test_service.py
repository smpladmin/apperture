import pytest
from datetime import datetime
from unittest.mock import ANY
from collections import namedtuple
from beanie import PydanticObjectId
from unittest.mock import MagicMock, AsyncMock

from domain.common.date_models import DateFilter, LastDateFilter, DateFilterType
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
    FunnelConversionData,
    FunnelConversion,
    FunnelEventUserData,
    ConversionStatus,
    ConversionWindow,
    ConversionWindowType,
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
        self.app_id = "636a1c61d715ca6baae65612"
        self.provider = IntegrationProvider.MIXPANEL
        self.user_id = "636a1c61d715ca6baae65611"
        self.name = "name"
        self.date_filter = DateFilter(
            filter=LastDateFilter(days=7), type=DateFilterType.LAST
        )

        FindMock = namedtuple("FindMock", ["to_list"])
        Funnel.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        Funnel.app_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Funnel.datasource_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.funnel_steps = [
            FunnelStep(event="Login"),
            FunnelStep(event="Chapter Click", filters=None),
        ]
        self.funnel = Funnel(
            datasource_id=self.ds_id,
            app_id=self.app_id,
            user_id=self.user_id,
            name=self.name,
            steps=self.funnel_steps,
            random_sequence=False,
            date_filter=DateFilter(
                filter=LastDateFilter(days=7), type=DateFilterType.LAST
            ),
            conversion_window=ConversionWindow(
                type=ConversionWindowType.MINUTES, value=10
            ),
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
            (1, 2022, 51, 100),
            (2, 2022, 55, 100),
            (3, 2022, 53, 100),
        ]
        self.funnel_trends_data = [
            FunnelTrendsData(
                conversion="{:.2f}".format(data[2] * 100 / data[3]),
                first_step_users=data[3],
                last_step_users=data[2],
                start_date=datetime.strptime(f"{data[1]}-{data[0]}-1", "%Y-%W-%w"),
                end_date=datetime.strptime(f"{data[1]}-{data[0]}-0", "%Y-%W-%w"),
            )
            for data in self.conversion_data
        ]

        self.user_data = [("user_1", [2, 2]), ("user_2", [2, 2])]

        self.funnel_conversion_data = FunnelConversionData(
            users=[FunnelEventUserData(id="user_1"), FunnelEventUserData(id="user_2")],
            total_users=2,
            unique_users=2,
        )

        self.funnels.get_users_count = MagicMock()
        self.funnels.get_users_count.return_value = [(100, 40)]
        self.funnels.get_conversion_trend = MagicMock()
        self.funnels.get_conversion_trend.return_value = self.conversion_data
        self.funnels.get_conversion_analytics = MagicMock()
        self.funnels.get_conversion_analytics.return_value = self.user_data
        FindOneMock = namedtuple("FindOneMock", ["update"])
        self.update_mock = AsyncMock()
        Funnel.find_one = MagicMock(return_value=FindOneMock(update=self.update_mock))
        Funnel.id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.funnels.compute_date_filter.return_value = ("2022-12-01", "2022-12-31")

    def test_build_funnel(self):

        funnel = self.service.build_funnel(
            datasourceId=PydanticObjectId(self.ds_id),
            appId=PydanticObjectId(self.app_id),
            userId=self.user_id,
            name=self.name,
            steps=self.funnel_steps,
            randomSequence=False,
            dateFilter=DateFilter(
                filter=LastDateFilter(days=7), type=DateFilterType.LAST
            ),
            conversionWindow=ConversionWindow(
                type=ConversionWindowType.MINUTES, value=10
            ),
        )

        assert filter_response(funnel.dict()) == filter_response(self.funnel.dict())

    @pytest.mark.parametrize(
        "n, data, conversion",
        [
            (1, (100, 40, 10), 40),
            (0, (100, 40, 10), 100),
            (1, (0, 40, 10), 0),
            (2, (100, 40, 10), 10),
        ],
    )
    def test_compute_conversion(self, n, data, conversion):
        assert conversion == self.service.compute_conversion(n, data)

    @pytest.mark.asyncio
    async def test_compute_funnel(self):
        assert self.computed_steps == await self.service.compute_funnel(
            ds_id=self.ds_id,
            steps=self.funnel_steps,
            date_filter=self.date_filter,
            conversion_window=ConversionWindow(
                type=ConversionWindowType.MINUTES, value=10
            ),
        )

    @pytest.mark.asyncio
    async def test_update_funnel(self):
        await self.service.update_funnel(funnel_id=self.ds_id, new_funnel=self.funnel)

        self.update_mock.assert_called_once_with(
            {
                "$set": {
                    "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                    "app_id": PydanticObjectId("636a1c61d715ca6baae65612"),
                    "conversion_window": {
                        "type": ConversionWindowType.MINUTES,
                        "value": 10,
                    },
                    "name": "name",
                    "random_sequence": False,
                    "revision_id": ANY,
                    "steps": [
                        {
                            "event": "Login",
                            "filters": None,
                        },
                        {"event": "Chapter Click", "filters": None},
                    ],
                    "updated_at": ANY,
                    "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                    "date_filter": DateFilter(
                        filter=LastDateFilter(days=7), type=DateFilterType.LAST
                    ),
                }
            },
        )

    @pytest.mark.asyncio
    async def test_get_funnel_trends(self):
        assert (
            await self.service.get_funnel_trends(
                datasource_id=str(self.funnel.datasource_id),
                steps=self.funnel.steps,
                date_filter=self.date_filter,
                conversion_window=ConversionWindow(
                    type=ConversionWindowType.MINUTES, value=10
                ),
            )
            == self.funnel_trends_data
        )

        self.funnels.get_conversion_trend.assert_called_once_with(
            **{
                "ds_id": "636a1c61d715ca6baae65611",
                "steps": [
                    FunnelStep(
                        event="Login",
                        filters=None,
                    ),
                    FunnelStep(event="Chapter Click", filters=None),
                ],
                "end_date": "2022-12-31",
                "start_date": "2022-12-01",
                "conversion_time": 600,
            }
        )

    @pytest.mark.asyncio
    async def test_get_funnels_for_apps(self):
        await self.service.get_funnels_for_apps(
            app_ids=[PydanticObjectId("6384a65e0a397236d9de236a")]
        )
        Funnel.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_conversion(self):
        assert (
            await self.service.get_user_conversion(
                datasource_id=str(self.funnel.datasource_id),
                steps=self.funnel_steps,
                status=ConversionStatus.CONVERTED,
                date_filter=self.date_filter,
                conversion_window=ConversionWindow(
                    type=ConversionWindowType.MINUTES, value=10
                ),
            )
            == self.funnel_conversion_data
        )

    @pytest.mark.asyncio
    async def test_get_funnels_for_datasource_id(self):
        await self.service.get_funnels_for_datasource_id(
            datasource_id="6384a65e0a397236d9de236a"
        )
        Funnel.find.assert_called_once()
