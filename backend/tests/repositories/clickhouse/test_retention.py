from unittest.mock import MagicMock

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
        self.retention_trend_query = (
            'WITH initial_count AS (SELECT toStartOfInterval("timestamp",INTERVAL \'1 '
            'DAY\') AS "granularity",COUNT(DISTINCT "user_id") AS "count" FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(start_event)s AND '
            'DATE("timestamp")>=%(start_date)s AND DATE("timestamp")<=%(end_date)s GROUP '
            'BY "granularity") ,retention_count AS (SELECT '
            'toStartOfInterval("events"."timestamp",INTERVAL \'1 DAY\') AS '
            '"granularity",COUNT(DISTINCT "events"."user_id") AS "count" FROM "events" '
            'JOIN "events" AS "events2" ON "events"."user_id"="events2"."user_id" AND '
            '"events2"."event_name"=%(goal_event)s AND '
            '"events"."event_name"=%(start_event)s AND "events"."datasource_id"=%(ds_id)s '
            'WHERE "events2"."timestamp">"events"."timestamp" AND "events2"."timestamp" '
            'BETWEEN toStartOfInterval("events"."timestamp"+INTERVAL \'0 DAY\',INTERVAL '
            '\'1 DAY\') AND toStartOfInterval("events"."timestamp"+INTERVAL \'1 '
            "DAY',INTERVAL '1 DAY')-INTERVAL '1 SECOND' AND "
            'DATE("events2"."timestamp")<=%(end_date)s GROUP BY "granularity") SELECT '
            '"initial_count"."granularity","retention_count"."count"/"initial_count"."count","retention_count"."count" '
            "FROM initial_count JOIN retention_count ON "
            '"initial_count"."granularity"="retention_count"."granularity" ORDER BY '
            '"granularity"'
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
            self.retention_trend_query, self.parameters
        )

    def test_build_retention_trend_query(self):
        assert self.repo.build_retention_trend_query(
            datasource_id=self.datasource_id,
            start_date=self.start_date,
            end_date=self.end_date,
            start_event=self.start_event,
            goal_event=self.goal_event,
            granularity=self.granularity,
            interval=0,
            segment_filter_criterion=None,
        ) == (self.retention_trend_query, self.parameters)

    def test_build_initial_count_query(self):
        assert self.repo.build_initial_count_query(
            granularity=self.granularity
        ).get_sql() == (
            "SELECT toStartOfInterval(\"timestamp\",INTERVAL '1 DAY') AS "
            '"granularity",COUNT(DISTINCT "user_id") AS "count" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(start_event)s AND '
            'DATE("timestamp")>=%(start_date)s AND DATE("timestamp")<=%(end_date)s GROUP '
            'BY "granularity"'
        )

    def test_build_retention_count_query(self):
        assert self.repo.build_retention_count_query(
            granularity=Granularity.WEEKS, interval=8
        ).get_sql() == (
            'SELECT toStartOfInterval("events"."timestamp",INTERVAL \'1 WEEK\') AS '
            '"granularity",COUNT(DISTINCT "events"."user_id") AS "count" FROM "events" '
            'JOIN "events" AS "events2" ON "events"."user_id"="events2"."user_id" AND '
            '"events2"."event_name"=%(goal_event)s AND '
            '"events"."event_name"=%(start_event)s AND "events"."datasource_id"=%(ds_id)s '
            'WHERE "events2"."timestamp">"events"."timestamp" AND "events2"."timestamp" '
            'BETWEEN toStartOfInterval("events"."timestamp"+INTERVAL \'8 WEEK\',INTERVAL '
            '\'1 WEEK\') AND toStartOfInterval("events"."timestamp"+INTERVAL \'9 '
            "WEEK',INTERVAL '1 WEEK')-INTERVAL '1 SECOND' AND "
            'DATE("events2"."timestamp")<=%(end_date)s GROUP BY "granularity"'
        )
