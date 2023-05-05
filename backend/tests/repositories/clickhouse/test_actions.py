from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from beanie import PydanticObjectId

from domain.actions.models import Action, ActionGroup, CaptureEvent, UrlMatching
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
        self.migration_query = (
            'INSERT INTO "events" SELECT '
            '"datasource_id","timestamp",\'apperture\',"user_id",\'clicked on '
            'settings\',"properties" FROM "clickstream" WHERE "datasource_id"=%(ds_id)s '
            "AND \"timestamp\"<=parseDateTimeBestEffort('2023-01-04T11:28:38.194662') AND "
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
            '"datasource_id"=%(ds_id)s AND match("element_chain",%(group_0_prepend_0_selector_regex)s) '
            "AND \"event\"='$autocapture' "
            "HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31' LIMIT 100"
        )

        self.matching_events_query_with_url = (
            'SELECT "event","user_id","properties","timestamp" FROM "clickstream" WHERE '
            '"datasource_id"=%(ds_id)s AND "properties.$current_url" LIKE %(group_0_prepend_url)s '
            "AND \"event\"='$autocapture' "
            "HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31' LIMIT 100"
        )

        self.count_matching_events_query = (
            'SELECT COUNT(*) FROM "clickstream" WHERE "datasource_id"=%(ds_id)s AND '
            'match("element_chain",%(group_0_prepend_0_selector_regex)s) AND "event"=\'$autocapture\' '
            "HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31'"
        )

    @pytest.mark.asyncio
    async def test_update_events_from_clickstream(self, patch_datetime_today):
        await self.repo.update_events_from_clickstream(
            action=self.action, update_action_func=AsyncMock()
        )
        self.repo.execute_get_query.assert_called_once_with(
            **{"query": self.migration_query, "parameters": self.parameters}
        )

    @pytest.mark.asyncio
    async def test_build_update_events_from_clickstream_query(
        self, patch_datetime_today
    ):
        assert await self.repo.build_update_events_from_clickstream_query(
            action=self.action
        ) == (
            self.migration_query,
            self.parameters,
            datetime(2023, 1, 4, 11, 28, 38, 194662),
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
