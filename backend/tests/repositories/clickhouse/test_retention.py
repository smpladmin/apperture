from unittest.mock import MagicMock, ANY

import pytest
from pypika import Interval

from domain.retention.models import EventSelection, Granularity
from repositories.clickhouse.retention import Retention


class TestRetentionRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Retention(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
        self.start_date = "2022-12-01"
        self.end_date = "2022-12-31"
        self.start_event = EventSelection(event="start_event", filters=None)
        self.goal_event = EventSelection(event="goal_event", filters=None)
        self.granularity = Granularity.DAYS
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
            "interval": ANY,
            "epoch_year": 1970,
        }
        self.retention_trend_query = (
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
            "GROUP BY 1,2) SELECT "
            '"start_event_sub_query"."granularity",COUNT(DISTINCT '
            '"start_event_sub_query"."user_id") AS "total_count",COUNT(CASE WHEN '
            'EXTRACT(YEAR FROM "goal_event_sub_query"."ts")>%(epoch_year)s AND '
            '"goal_event_sub_query"."ts">"start_event_sub_query"."ts" THEN '
            '"goal_event_sub_query"."user_id" ELSE NULL END) AS '
            '"retention_count" FROM start_event_sub_query LEFT JOIN '
            "goal_event_sub_query ON "
            '"start_event_sub_query"."user_id"="goal_event_sub_query"."user_id" '
            "AND "
            '"start_event_sub_query"."granularity"+%(interval)s="goal_event_sub_query"."granularity" '
            'GROUP BY "granularity" ORDER BY "granularity"'
        )

    def test_compute_retention_trend(self):
        self.repo.compute_retention_trend(
            datasource_id=self.datasource_id,
            start_date=self.start_date,
            end_date=self.end_date,
            start_event=self.start_event,
            goal_event=self.goal_event,
            granularity=self.granularity,
            interval=0,
            segment_filter_criterion=None,
        )
        self.repo.execute_get_query.assert_called_once_with(
            **{
                "query": self.retention_trend_query,
                "parameters": self.retention_parameters,
            }
        )

    def test_build_retention_trend_query(self):
        assert (
            self.repo.build_retention_trend_query(
                granularity=self.granularity,
                segment_filter_criterion=None,
            ).get_sql()
            == self.retention_trend_query
        )

    @pytest.mark.parametrize("event_flag, result", [(True, (
            'SELECT "user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
            '"granularity",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s AND "event_name"=%(start_event)s GROUP BY '
            '1,2'
    )), (False, (
            'SELECT "user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
            '"granularity",MAX("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s AND "event_name"=%(goal_event)s GROUP BY 1,2'
    ))])
    def test_build_sub_query(self, event_flag, result):
        assert self.repo.build_sub_query(granularity=self.granularity, event_flag=event_flag).get_sql() == result

    def test_compute_retention(self):
        self.repo.execute_get_query.return_value = [(0.5516,)]
        assert self.repo.compute_retention(
            datasource_id=self.datasource_id,
            start_date=self.start_date,
            end_date=self.end_date,
            start_event=self.start_event,
            goal_event=self.goal_event,
            granularity=self.granularity,
            start_index=0,
            end_index=4,
            segment_filter_criterion=None,
        )
        self.repo.execute_get_query.assert_called_with(
            **{
                "parameters": self.retention_parameters,
                "query": (
                    'SELECT SUM("retention_count")/SUM("total_count") FROM (WITH '
                    "start_event_sub_query AS (SELECT "
                    '"user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
                    '"granularity",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
                    'DATE("timestamp")<=%(end_date)s AND "event_name"=%(start_event)s '
                    "GROUP BY 1,2) ,goal_event_sub_query AS (SELECT "
                    '"user_id",toStartOfInterval("timestamp",INTERVAL \'1 DAY\') AS '
                    '"granularity",MAX("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
                    'DATE("timestamp")<=%(end_date)s AND "event_name"=%(goal_event)s '
                    "GROUP BY 1,2) SELECT "
                    '"start_event_sub_query"."granularity",COUNT(DISTINCT '
                    '"start_event_sub_query"."user_id") AS "total_count",COUNT(CASE WHEN '
                    'EXTRACT(YEAR FROM "goal_event_sub_query"."ts")>%(epoch_year)s AND '
                    '"goal_event_sub_query"."ts">"start_event_sub_query"."ts" THEN '
                    '"goal_event_sub_query"."user_id" ELSE NULL END) AS '
                    '"retention_count" FROM start_event_sub_query LEFT JOIN '
                    "goal_event_sub_query ON "
                    '"start_event_sub_query"."user_id"="goal_event_sub_query"."user_id" '
                    "AND "
                    '"start_event_sub_query"."granularity"+%(interval)s="goal_event_sub_query"."granularity" '
                    'GROUP BY "granularity" ORDER BY "granularity") AS "sq0"'
                ),
            }
        )
