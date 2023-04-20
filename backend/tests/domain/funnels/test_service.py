import asyncio
import pytest
from datetime import datetime
from unittest.mock import ANY
from collections import namedtuple
from beanie import PydanticObjectId
from unittest.mock import MagicMock, AsyncMock
from domain.notifications.models import (
    Notification,
    NotificationData,
    ThresholdMap,
    NotificationVariant,
)

from domain.common.date_models import (
    DateFilter,
    LastDateFilter,
    DateFilterType,
    FixedDateFilter,
)
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
    FunnelEventUserData,
    ConversionStatus,
    ConversionWindow,
    ConversionWindowType,
)


class TestFunnelService:
    def setup_method(self):
        Funnel.get_settings = MagicMock()
        Notification.get_settings = MagicMock()
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
            enabled=True,
            conversion_window=ConversionWindow(
                type=ConversionWindowType.MINUTES, value=10
            ),
        )
        self.computed_steps = [
            ComputedFunnelStep(
                event="Login",
                users=100,
                conversion=100.0,
                conversion_wrt_previous=100.0,
            ),
            ComputedFunnelStep(
                event="Chapter Click",
                users=40,
                conversion=40.0,
                conversion_wrt_previous=40.0,
            ),
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
        Funnel.enabled = True
        self.funnel_notifications = [
            Notification(
                id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                revision_id=None,
                created_at=datetime(2023, 4, 13, 6, 34, 32, 876000),
                updated_at=datetime(2023, 4, 13, 8, 16, 16, 593000),
                datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
                user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
                app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
                name="Video Funnel",
                notification_type={"alert", "update"},
                metric="hits",
                multi_node=False,
                apperture_managed=False,
                pct_threshold_active=False,
                pct_threshold_values=None,
                absolute_threshold_active=True,
                absolute_threshold_values=ThresholdMap(min=1212.0, max=3236.0),
                formula="a",
                variable_map={"a": ["Video Funnel"]},
                preferred_hour_gmt=5,
                frequency="daily",
                preferred_channels=["slack"],
                notification_active=True,
                variant="metric",
                reference="63dcfe6a21a93919c672d5bb",
                enabled=True,
            )
        ]

    def test_build_funnel(self):

        funnel = self.service.build_funnel(
            datasource_id=PydanticObjectId(self.ds_id),
            app_id=PydanticObjectId(self.app_id),
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

        assert filter_response(funnel.dict()) == filter_response(self.funnel.dict())

    @pytest.mark.parametrize(
        "n, data, conversion, wrt_previous",
        [
            (1, [100, 40, 10], 40, False),
            (0, [100, 40, 10], 100, False),
            (1, [0, 40, 10], 0, False),
            (2, [100, 40, 10], 10, False),
            (2, [100, 40, 10], 25, True),
            (0, [100, 40, 10], 100, True),
        ],
    )
    def test_compute_conversion(self, n, data, conversion, wrt_previous):
        assert conversion == self.service.compute_conversion(n, data, wrt_previous)

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
                    "enabled": True,
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

    @pytest.mark.asyncio
    async def test_delete_funnel(self):
        await self.service.delete_funnel(funnel_id="6384a65e0a397236d9de236a")
        Funnel.find_one.assert_called_once()
        self.update_mock.assert_called_once_with({"$set": {"enabled": False}})

    @pytest.mark.parametrize(
        "conversion_window, result",
        [
            (None, 30 * 24 * 60 * 60),
            (ConversionWindow(type=ConversionWindowType.MINUTES, value=10), 10 * 60),
        ],
    )
    def test_compute_conversion_time(self, conversion_window, result):
        assert (
            self.service.compute_conversion_time(conversion_window=conversion_window)
            == result
        )

    @pytest.mark.parametrize(
        "date_filter, result",
        [
            (None, (None, None)),
            (
                DateFilter(
                    type=DateFilterType.FIXED,
                    filter=FixedDateFilter(
                        start_date="2022-01-01", end_date="2023-01-01"
                    ),
                ),
                ("2022-12-01", "2022-12-31"),
            ),
        ],
    )
    def test_extract_date_range(self, date_filter, result):
        assert self.service.extract_date_range(date_filter=date_filter) == result

    @pytest.mark.asyncio
    async def test_get_funnel_data_for_notification(self):
        notification_data_future = asyncio.Future()
        notification_data_future.set_result(0.2)
        self.service.get_notification_data = MagicMock(
            return_value=notification_data_future
        )
        assert await self.service.get_funnel_data_for_notifications(
            notifications=self.funnel_notifications
        ) == [
            NotificationData(
                name="Video Funnel",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.FUNNEL,
                value=0.2,
                prev_day_value=0.2,
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=1212.0, max=3236.0),
            )
        ]
        self.service.get_notification_data.assert_called_with(
            days_ago=2,
            notification=Notification(
                id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                revision_id=None,
                created_at=datetime(2023, 4, 13, 6, 34, 32, 876000),
                updated_at=datetime(2023, 4, 13, 8, 16, 16, 593000),
                datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
                user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
                app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
                name="Video Funnel",
                notification_type={"alert", "update"},
                metric="hits",
                multi_node=False,
                apperture_managed=False,
                pct_threshold_active=False,
                pct_threshold_values=None,
                absolute_threshold_active=True,
                absolute_threshold_values=ThresholdMap(min=1212.0, max=3236.0),
                formula="a",
                variable_map={"a": ["Video Funnel"]},
                preferred_hour_gmt=5,
                frequency="daily",
                preferred_channels=["slack"],
                notification_active=True,
                variant="metric",
                reference="63dcfe6a21a93919c672d5bb",
                enabled=True,
            ),
        ),

    @pytest.mark.asyncio
    async def test_get_notification_data(self):
        funnel_future = asyncio.Future()
        funnel_future.set_result(self.funnel)

        self.service.get_funnel = MagicMock(return_value=funnel_future)
        self.service.compute_conversion_time = MagicMock(return_value=9600000)

        self.funnels.get_users_count = MagicMock(return_value=[(200, 10, 40)])
        assert (
            await self.service.get_notification_data(
                notification=self.funnel_notifications[0], days_ago=2
            )
            == 20.0
        )

        self.funnels.get_users_count.assert_called_with(
            **{
                "conversion_time": 9600000,
                "ds_id": "636a1c61d715ca6baae65611",
                "end_date": ANY,
                "start_date": ANY,
                "steps": [
                    FunnelStep(event="Login", filters=None),
                    FunnelStep(event="Chapter Click", filters=None),
                ],
            }
        )
