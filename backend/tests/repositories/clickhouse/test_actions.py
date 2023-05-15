import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, ANY

import pytest
from beanie import PydanticObjectId

from domain.actions.models import (
    Action,
    ActionGroup,
    CaptureEvent,
    UrlMatching,
    ActionGroupCondition,
)
from repositories.clickhouse.actions import Actions


class TestActionsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Actions(self.clickhouse)
        Action.get_settings = MagicMock()
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = PydanticObjectId("636a1c61d715ca6baae65611")
        self.event = CaptureEvent.AUTOCAPTURE
        self.start_date = "2022-12-01"
        self.end_date = "2022-12-31"
        self.action = Action(
            datasource_id=self.datasource_id,
            app_id=self.datasource_id,
            user_id=self.datasource_id,
            name="clicked on settings",
            groups=[
                ActionGroup(
                    event=CaptureEvent.AUTOCAPTURE,
                    selector="#__next > div > div.css-3h169z > div.css-8xl60i > button",
                )
            ],
            event_type="$autocapture",
        )
        self.date_format = "%Y-%m-%d %H:%M:%S"
        self.past_six_hours_datetime_string = (
            datetime.now() - timedelta(hours=6)
        ).strftime(self.date_format)

        self.past_six_hours_datetime = datetime.strptime(
            self.past_six_hours_datetime_string, self.date_format
        )

        self.action_with_processed_till = Action(
            datasource_id=self.datasource_id,
            app_id=self.datasource_id,
            user_id=self.datasource_id,
            name="clicked on settings",
            groups=[
                ActionGroup(
                    event=CaptureEvent.AUTOCAPTURE,
                    selector="#__next > div > div.css-3h169z > div.css-8xl60i > button",
                )
            ],
            event_type="$autocapture",
            processed_till=self.past_six_hours_datetime,
        )
        self.min_timestamp = datetime(2023, 1, 4, 11, 28, 38)
        self.start_time = datetime(2023, 1, 4, 11, 28, 38)
        self.end_time = datetime(2023, 1, 10, 11, 28, 38)

        self.min_timestamp_query = (
            'SELECT MIN("timestamp") FROM "clickstream" WHERE '
            '"datasource_id"=%(ds_id)s'
        )

        self.min_timestamp_params = {
            "ds_id": "636a1c61d715ca6baae65611",
        }

        self.migration_query = (
            'INSERT INTO "events" SELECT '
            '"datasource_id","timestamp",\'apperture\',"user_id",\'clicked on '
            'settings\',"properties" FROM "clickstream" WHERE "datasource_id"=%(ds_id)s '
            "AND \"timestamp\">parseDateTimeBestEffort('2023-01-04T11:28:38') AND "
            "\"timestamp\"<=parseDateTimeBestEffort('2023-01-05T11:28:38') AND "
            'match("element_chain",%(group_0_prepend_0_selector_regex)s) AND "event"=\'$autocapture\''
        )
        self.parameters = {
            "group_0_prepend_0_selector_regex": 'button([-_a-zA-Z0-9\\.:"= '
            ']*?)?($|;|:([^;^\\s]*(;|$|\\s)))div.*?\\.css-8xl60i([-_a-zA-Z0-9\\.:"= '
            ']*?)?($|;|:([^;^\\s]*(;|$|\\s))).*div.*?\\.css-3h169z([-_a-zA-Z0-9\\.:"= '
            ']*?)?($|;|:([^;^\\s]*(;|$|\\s))).*div([-_a-zA-Z0-9\\.:"= '
            ']*?)?($|;|:([^;^\\s]*(;|$|\\s))).*.*?attr_id="__next".*?([-_a-zA-Z0-9\\.:"= '
            "]*?)?($|;|:([^;^\\s]*(;|$|\\s))).*",
            "ds_id": "636a1c61d715ca6baae65611",
        }

        self.parameters_with_url_matching = {
            "ds_id": "636a1c61d715ca6baae65611",
            "group_0_prepend_url": "%/analytics/%/list%",
        }

        self.matching_events_query = (
            'SELECT "event","user_id","properties","timestamp" FROM "clickstream" WHERE '
            '"datasource_id"=%(ds_id)s '
            "AND DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31' "
            'AND match("element_chain",%(group_0_prepend_0_selector_regex)s) '
            "AND \"event\"='$autocapture' ORDER BY 4 DESC LIMIT 100"
        )

        self.matching_events_query_with_url = (
            'SELECT "event","user_id","properties","timestamp" FROM "clickstream" WHERE '
            '"datasource_id"=%(ds_id)s '
            "AND DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31' AND "
            '"properties.$current_url" LIKE %(group_0_prepend_url)s '
            "AND \"event\"='$autocapture' ORDER BY 4 DESC LIMIT 100"
        )

        self.count_matching_events_query = (
            'SELECT COUNT(*) FROM "clickstream" WHERE "datasource_id"=%(ds_id)s '
            "AND DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31' "
            'AND match("element_chain",%(group_0_prepend_0_selector_regex)s) '
            "AND \"event\"='$autocapture'"
        )

    @pytest.mark.asyncio
    async def test_update_events_from_clickstream(self, patch_datetime_today):
        self.repo.build_update_events_from_clickstream_query = AsyncMock(
            return_value=(
                self.migration_query,
                self.parameters,
                datetime(2023, 1, 5, 11, 28, 38),
            )
        )
        await self.repo.update_events_from_clickstream(
            action=self.action, update_action_func=AsyncMock()
        )

        self.repo.build_update_events_from_clickstream_query.assert_called_once()

        assert self.repo.build_update_events_from_clickstream_query.call_args.kwargs[
            "action"
        ].dict() == {
            "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "created_at": ANY,
            "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "enabled": True,
            "event_type": CaptureEvent.AUTOCAPTURE,
            "groups": [
                {
                    "condition": ActionGroupCondition.OR,
                    "event": CaptureEvent.AUTOCAPTURE,
                    "href": None,
                    "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                    "button",
                    "tag_name": None,
                    "text": None,
                    "url": None,
                    "url_matching": None,
                }
            ],
            "id": None,
            "name": "clicked on settings",
            "processed_till": None,
            "revision_id": None,
            "updated_at": None,
            "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        }
        self.repo.execute_get_query.assert_called_once_with(
            **{"parameters": self.parameters, "query": self.migration_query}
        )

    @pytest.mark.asyncio
    async def test_build_update_events_from_clickstream_query(
        self, patch_datetime_today
    ):
        self.repo.get_minimum_timestamp_of_events = MagicMock(
            return_value=[(self.min_timestamp,)]
        )
        assert await self.repo.build_update_events_from_clickstream_query(
            action=self.action
        ) == (
            self.migration_query,
            self.parameters,
            datetime(2023, 1, 5, 11, 28, 38),
        )
        self.repo.get_minimum_timestamp_of_events.assert_called_once_with(
            **{"datasource_id": "636a1c61d715ca6baae65611"}
        )

    def test_get_minimum_timestamp_of_events(self):
        self.repo.get_minimum_timestamp_of_events(datasource_id=str(self.datasource_id))
        self.repo.execute_get_query.assert_called_once_with(
            **{
                "parameters": self.min_timestamp_params,
                "query": self.min_timestamp_query,
            }
        )

    def test_compute_migration_start_and_end_time(self):
        self.repo.get_minimum_timestamp_of_events = MagicMock(
            return_value=[(self.min_timestamp,)]
        )
        assert self.repo.compute_migration_start_and_end_time(action=self.action) == (
            datetime(2023, 1, 4, 11, 28, 38),
            datetime(2023, 1, 5, 11, 28, 38),
        )

    def test_compute_migration_start_and_end_time_with_time_difference_less_than_24_hours(
        self,
    ):
        assert self.repo.compute_migration_start_and_end_time(
            action=self.action_with_processed_till
        ) == (
            self.past_six_hours_datetime,
            datetime.strptime(
                datetime.now().strftime(self.date_format), self.date_format
            ),
        )

    @pytest.mark.asyncio
    async def test_build_matching_events_from_clickstream_query(self):
        assert await self.repo.build_matching_events_from_clickstream_query(
            datasource_id="636a1c61d715ca6baae65611",
            groups=self.action.groups,
            start_date=self.start_date,
            end_date=self.end_date,
        ) == (self.matching_events_query, self.parameters)

    @pytest.mark.asyncio
    async def test_build_matching_events_query_with_url(self):
        groups = [
            ActionGroup(
                event=CaptureEvent.AUTOCAPTURE,
                url="/analytics/%/list",
                url_matching=UrlMatching.CONTAINS,
            )
        ]
        assert await self.repo.build_matching_events_from_clickstream_query(
            datasource_id="636a1c61d715ca6baae65611",
            groups=groups,
            start_date=self.start_date,
            end_date=self.end_date,
        ) == (self.matching_events_query_with_url, self.parameters_with_url_matching)

    @pytest.mark.asyncio
    async def test_build_count_matching_events_from_clickstream_query(self):
        assert await self.repo.build_count_matching_events_from_clickstream_query(
            datasource_id="636a1c61d715ca6baae65611",
            groups=self.action.groups,
            start_date=self.start_date,
            end_date=self.end_date,
        ) == (self.count_matching_events_query, self.parameters)
