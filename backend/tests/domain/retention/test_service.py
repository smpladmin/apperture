from collections import namedtuple
from datetime import datetime
from unittest.mock import ANY, AsyncMock, MagicMock

import pytest
from beanie import PydanticObjectId

from domain.common.date_models import DateFilter, DateFilterType, LastDateFilter
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource
from domain.retention.models import (
    ComputedRetention,
    EventSelection,
    Granularity,
    Retention,
)
from domain.retention.service import RetentionService
from tests.utils import filter_response


class TestRetentionService:
    def setup_method(self):
        Retention.get_settings = MagicMock()
        Retention.find_one = AsyncMock()
        Retention.update = AsyncMock()
        DataSource.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.retention = MagicMock()
        self.date_utils = MagicMock()
        self.service = RetentionService(
            mongo=self.mongo, retention=self.retention, date_utils=self.date_utils
        )
        self.ds_id = "636a1c61d715ca6baae65611"
        self.app_id = "636a1c61d715ca6baae65612"
        self.provider = IntegrationProvider.MIXPANEL
        self.user_id = "636a1c61d715ca6baae65611"
        self.name = "name"
        self.date_filter = DateFilter(
            filter=LastDateFilter(days=7), type=DateFilterType.LAST
        )

        FindMock = namedtuple("FindMock", ["to_list"])
        Retention.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        Retention.app_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Retention.datasource_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.start_event = EventSelection(event="start_event", filters=None)
        self.goal_event = EventSelection(event="goal_event", filters=None)
        self.retention_obj = Retention(
            datasource_id=self.ds_id,
            app_id=self.app_id,
            user_id=self.user_id,
            name=self.name,
            start_event=self.start_event,
            goal_event=self.goal_event,
            granularity=Granularity.DAYS,
            segment_filter=None,
            date_filter=DateFilter(
                filter=LastDateFilter(days=7), type=DateFilterType.LAST
            ),
            enabled=True,
        )

        FindOneMock = namedtuple("FindOneMock", ["update"])
        self.update_mock = AsyncMock()
        Retention.find_one = MagicMock(
            return_value=FindOneMock(update=self.update_mock)
        )
        Retention.get = AsyncMock()
        Retention.insert = AsyncMock()
        Retention.id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.retention.compute_retention = AsyncMock(
            return_value=[
                (datetime(2022, 1, 1, 0, 0), 1, 110, datetime(2022, 1, 1, 0, 0), 215),
                (datetime(2022, 1, 2, 0, 0), 1, 108, datetime(2022, 1, 2, 0, 0), 206),
                (datetime(2022, 1, 3, 0, 0), 1, 115, datetime(2022, 1, 3, 0, 0), 230),
            ]
        )
        self.date_utils.compute_date_filter.return_value = ("2022-12-01", "2022-12-31")
        self.date_utils.compute_days_in_date_range.return_value = 4
        Retention.enabled = True

    def test_build_retention(self):
        retention = self.service.build_retention(
            datasource_id=PydanticObjectId(self.ds_id),
            app_id=PydanticObjectId(self.app_id),
            user_id=self.user_id,
            name=self.name,
            start_event=self.start_event,
            goal_event=self.goal_event,
            granularity=Granularity.DAYS,
            date_filter=DateFilter(
                filter=LastDateFilter(days=7), type=DateFilterType.LAST
            ),
            segment_filter=None,
        )

        assert filter_response(retention.dict()) == filter_response(
            self.retention_obj.dict()
        )

    @pytest.mark.asyncio
    async def test_compute_retention(self):
        assert await self.service.compute_retention(
            datasource_id=self.ds_id,
            app_id=self.app_id,
            start_event=self.start_event,
            goal_event=self.goal_event,
            granularity=Granularity.DAYS,
            segment_filter=None,
            date_filter=self.date_filter,
        ) == [
            ComputedRetention(
                granularity=datetime(2022, 1, 1, 0, 0),
                interval=1,
                interval_name="day 1",
                initial_users=215,
                retention_rate=51.16,
                retained_users=110,
            ),
            ComputedRetention(
                granularity=datetime(2022, 1, 2, 0, 0),
                interval=1,
                interval_name="day 1",
                initial_users=206,
                retention_rate=52.43,
                retained_users=108,
            ),
            ComputedRetention(
                granularity=datetime(2022, 1, 3, 0, 0),
                interval=1,
                interval_name="day 1",
                initial_users=230,
                retention_rate=50.0,
                retained_users=115,
            ),
        ]
        self.retention.compute_retention.assert_called_once_with(
            **{
                "datasource_id": "636a1c61d715ca6baae65611",
                "app_id": "636a1c61d715ca6baae65612",
                "end_date": "2022-12-31",
                "goal_event": EventSelection(event="goal_event", filters=None),
                "granularity": Granularity.DAYS,
                "segment_filter_criterion": None,
                "start_date": "2022-12-01",
                "start_event": EventSelection(event="start_event", filters=None),
            }
        )
        self.date_utils.compute_date_filter.assert_called_once_with(
            **{
                "date_filter": LastDateFilter(days=7),
                "date_filter_type": DateFilterType.LAST,
            }
        )

    @pytest.mark.asyncio
    async def test_update_retention(self):
        await self.service.update_retention(
            retention_id=self.ds_id, new_retention=self.retention_obj
        )
        self.update_mock.assert_called_once_with(
            {
                "$set": {
                    "app_id": PydanticObjectId("636a1c61d715ca6baae65612"),
                    "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                    "date_filter": {"filter": {"days": 7}, "type": DateFilterType.LAST},
                    "enabled": True,
                    "goal_event": {"event": "goal_event", "filters": None},
                    "granularity": Granularity.DAYS,
                    "name": "name",
                    "revision_id": None,
                    "segment_filter": None,
                    "start_event": {"event": "start_event", "filters": None},
                    "updated_at": ANY,
                    "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
                }
            },
        )

    @pytest.mark.asyncio
    async def test_get_retentions_for_apps(self):
        await self.service.get_retentions_for_apps(
            app_ids=[PydanticObjectId("6384a65e0a397236d9de236a")]
        )
        Retention.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_retentions_for_datasource_id(self):
        await self.service.get_retentions_for_datasource_id(
            datasource_id="6384a65e0a397236d9de236a"
        )
        Retention.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_retention(self):
        await self.service.delete_retention(retention_id="6384a65e0a397236d9de236a")
        Retention.find_one.assert_called_once()
        self.update_mock.assert_called_once_with({"$set": {"enabled": False}})

    @pytest.mark.asyncio
    async def test_get_retention(self):
        await self.service.get_retention(id="6384a65e0a397236d9de236a")
        Retention.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_add_retention(self):
        await self.service.add_retention(retention=self.retention_obj)
        Retention.insert.assert_called_once()
