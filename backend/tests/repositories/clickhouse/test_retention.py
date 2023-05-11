from unittest.mock import MagicMock

import pytest
from pypika import ClickHouseQuery

from domain.common.filter_models import FilterOperatorsString, FilterDataType
from domain.retention.models import EventSelection, Granularity
from domain.segments.models import WhereSegmentFilter, SegmentFilterConditions
from repositories.clickhouse.retention import Retention
from repositories.clickhouse.utils.filters import Filters


class TestRetentionRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        self.filter_utils = Filters()
        repo = Retention(self.clickhouse, self.filter_utils)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
        self.start_date = "2022-12-01"
        self.end_date = "2022-12-31"
        self.start_event = EventSelection(event="start_event", filters=None)
        self.goal_event = EventSelection(event="goal_event", filters=None)
        self.granularity = Granularity.DAYS
        self.segment_filter_criterion = self.repo.table.user_id.isin(
            ClickHouseQuery.from_(self.repo.table).select("*")
        )
        self.parameters = {
            "ds_id": "test-id",
            "end_date": "2022-12-31",
            "goal_event": "goal_event",
            "start_date": "2022-12-01",
            "start_event": "start_event",
        }
        self.retention_parameters = {
            "ds_id": "test-id",
            "end_date": "2022-12-31",
            "goal_event": "goal_event",
            "start_date": "2022-12-01",
            "start_event": "start_event",
            "epoch_year": 1970,
        }
        self.retention_query = (
            "WITH start_event_sub_query AS (SELECT "
            '"user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
            '"granularity",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s AND "event_name"=%(start_event)s '
            "GROUP BY 1,2) ,goal_event_sub_query AS (SELECT "
            '"user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
            '"granularity",MAX("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s AND "event_name"=%(goal_event)s '
            "GROUP BY 1,2) ,initial_count_query AS (SELECT "
            '"start_event_sub_query"."granularity",COUNT(*) FROM '
            "start_event_sub_query GROUP BY 1 ORDER BY 1) ,retention_count_query "
            "AS (SELECT "
            '"start_event_sub_query"."granularity",dateDiff(\'day\',"start_event_sub_query"."granularity","goal_event_sub_query"."granularity"),COUNT(*) '
            "FROM start_event_sub_query JOIN goal_event_sub_query ON "
            '"start_event_sub_query"."user_id"="goal_event_sub_query"."user_id" '
            'WHERE "goal_event_sub_query"."ts">"start_event_sub_query"."ts" '
            "GROUP BY 1,2 ORDER BY 2,1) SELECT * FROM retention_count_query LEFT "
            "JOIN initial_count_query ON "
            '"retention_count_query"."granularity"="initial_count_query"."granularity"'
        )

    def test_compute_retention(self):
        self.repo.compute_retention(
            datasource_id=self.datasource_id,
            start_date=self.start_date,
            end_date=self.end_date,
            start_event=self.start_event,
            goal_event=self.goal_event,
            granularity=self.granularity,
            segment_filter_criterion=None,
        )
        self.repo.execute_get_query.assert_called_once_with(
            **{
                "query": self.retention_query,
                "parameters": self.retention_parameters,
            }
        )

    def test_build_retention_query(self):
        assert (
            self.repo.build_retention_query(
                granularity=self.granularity,
                segment_filter_criterion=None,
                start_event=self.start_event,
                goal_event=self.goal_event,
            )
            == self.retention_query
        )

    @pytest.mark.parametrize(
        "event_flag, event, result",
        [
            (
                True,
                EventSelection(event="start_event", filters=None),
                (
                    'SELECT "user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
                    '"granularity",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
                    'DATE("timestamp")<=%(end_date)s AND "event_name"=%(start_event)s GROUP BY '
                    "1,2"
                ),
            ),
            (
                False,
                EventSelection(
                    event="goal_event",
                    filters=[
                        WhereSegmentFilter(
                            operator=FilterOperatorsString.IS,
                            operand="properties.$city",
                            values=["Bengaluru"],
                            all=False,
                            type=SegmentFilterConditions.WHERE,
                            condition=SegmentFilterConditions.WHERE,
                            datatype=FilterDataType.STRING,
                        )
                    ],
                ),
                (
                    'SELECT "user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
                    '"granularity",MAX("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
                    'DATE("timestamp")<=%(end_date)s AND "event_name"=%(goal_event)s AND '
                    "\"properties.properties.$city\" IN ('Bengaluru') GROUP BY 1,2"
                ),
            ),
        ],
    )
    def test_build_sub_query(self, event_flag, event, result):
        assert (
            self.repo.build_sub_query(
                granularity=self.granularity,
                event_flag=event_flag,
                event=event,
                segment_filter_criterion=None,
            ).get_sql()
            == result
        )

    def test_build_sub_query_with_segment_filter(self):
        assert self.repo.build_sub_query(
            granularity=self.granularity,
            event_flag=True,
            event=self.start_event,
            segment_filter_criterion=self.segment_filter_criterion,
        ).get_sql() == (
            'SELECT "user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
            '"granularity",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s AND "event_name"=%(start_event)s AND '
            '"user_id" IN (SELECT * FROM "events") GROUP BY 1,2'
        )
