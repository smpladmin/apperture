import pytest
from pypika import Table
from unittest.mock import MagicMock

from domain.segments.models import (
    WhereSegmentFilter,
    SegmentFilterOperatorsString,
    SegmentFilterConditions,
    SegmentDataType,
)
from domain.funnels.models import FunnelStep
from repositories.clickhouse.funnels import Funnels, ConversionStatus


class TestFunnelsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Funnels(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
        self.steps = [
            FunnelStep(event="Video_Open", filters=[]),
            FunnelStep(event="Video_Seen", filters=[]),
            FunnelStep(
                event="Download_Video",
                filters=[
                    WhereSegmentFilter(
                        operator=SegmentFilterOperatorsString.IS,
                        operand="prop1",
                        values=[10],
                        all=False,
                        type=SegmentFilterConditions.WHERE,
                        condition=SegmentFilterConditions.WHERE,
                        datatype=SegmentDataType.STRING,
                    )
                ],
            ),
        ]
        self.parameters = {
            "ds_id": self.datasource_id,
            "conversion_time": 600,
            "epoch_year": 1970,
            "event0": "Video_Open",
            "event1": "Video_Seen",
            "event2": "Download_Video",
        }
        self.users_query = (
            'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1) '
            ',table2 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1) ,table3 AS '
            '(SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            'IN (10) GROUP BY 1) SELECT COUNT(DISTINCT "table1"."user_id"),COUNT(CASE '
            'WHEN EXTRACT(YEAR FROM "table1"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
            'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
            '"table3"."user_id" ELSE NULL END) FROM table1 LEFT JOIN table2 ON '
            '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
            '"table1"."user_id"="table3"."user_id"'
        )

        self.users_query_with_date_filter = (
            'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1 '
            "HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31') ,table2 AS (SELECT "
            '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1 HAVING '
            "DATE(\"timestamp\")>='2022-12-01' AND DATE(\"timestamp\")<='2022-12-31') "
            ',table3 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            "IN (10) GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31') SELECT COUNT(DISTINCT "
            '"table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
            '"table1"."ts")>%(epoch_year)s AND "table2"."ts">"table1"."ts" THEN '
            '"table2"."user_id" ELSE NULL END),COUNT(CASE WHEN EXTRACT(YEAR FROM '
            '"table2"."ts")>%(epoch_year)s AND "table3"."ts">"table2"."ts" AND '
            '"table2"."ts">"table1"."ts" THEN "table3"."user_id" ELSE NULL END) FROM '
            'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
            'table3 ON "table1"."user_id"="table3"."user_id"'
        )

        self.trends_query_with_date_filter = (
            'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1 '
            "HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31') ,table2 AS (SELECT "
            '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1 HAVING '
            "DATE(\"timestamp\")>='2022-12-01' AND DATE(\"timestamp\")<='2022-12-31') "
            ',table3 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            "IN (10) GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            'DATE("timestamp")<=\'2022-12-31\') SELECT WEEK("table1"."ts"),EXTRACT(YEAR '
            'FROM "table1"."ts"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
            '"table2"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table2"."ts">="table1"."ts" AND "table3"."ts">="table2"."ts" THEN '
            '"table3"."user_id" ELSE NULL END),COUNT(DISTINCT "table1"."user_id") FROM '
            'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
            'table3 ON "table1"."user_id"="table3"."user_id" GROUP BY 1,2 ORDER BY 2,1'
        )
        self.table = Table("events")
        self.start_date = "2022-12-01"
        self.end_date = "2022-12-31"
        self.analytics_query = (
            'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1) '
            ',table2 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1) ,table3 AS '
            '(SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            'IN (10) GROUP BY 1) ,final_table AS (SELECT "table1"."user_id" AS "0",CASE '
            'WHEN EXTRACT(YEAR FROM "table1"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL END AS '
            '"1",CASE WHEN EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
            '"table3"."user_id" ELSE NULL END AS "2" FROM table1 LEFT JOIN table2 ON '
            '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
            '"table1"."user_id"="table3"."user_id") SELECT "1",(SELECT '
            'COUNT("1"),COUNT(DISTINCT "1") FROM final_table WHERE NOT "2" IS NULL) FROM '
            'final_table WHERE NOT "2" IS NULL AND NOT "1" IS NULL LIMIT 100'
        )

    @pytest.mark.parametrize(
        "start_date, end_date, result",
        [
            (
                None,
                None,
                (
                    'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
                    'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1) '
                    ',table2 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1) ,table3 AS '
                    '(SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
                    'IN (10) GROUP BY 1) SELECT COUNT(DISTINCT "table1"."user_id"),COUNT(CASE '
                    'WHEN EXTRACT(YEAR FROM "table1"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
                    'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
                    '"table3"."user_id" ELSE NULL END) FROM table1 LEFT JOIN table2 ON '
                    '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
                    '"table1"."user_id"="table3"."user_id"'
                ),
            ),
            (
                "2022-12-01",
                "2022-12-31",
                (
                    'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
                    'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1 '
                    "HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    "DATE(\"timestamp\")<='2022-12-31') ,table2 AS (SELECT "
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1 HAVING '
                    "DATE(\"timestamp\")>='2022-12-01' AND DATE(\"timestamp\")<='2022-12-31') "
                    ',table3 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
                    "IN (10) GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    "DATE(\"timestamp\")<='2022-12-31') SELECT COUNT(DISTINCT "
                    '"table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
                    '"table1"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
                    'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
                    '"table3"."user_id" ELSE NULL END) FROM table1 LEFT JOIN table2 ON '
                    '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
                    '"table1"."user_id"="table3"."user_id"'
                ),
            ),
        ],
    )
    def test_get_users_count(self, start_date, end_date, result):
        self.repo.get_users_count(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=start_date,
            end_date=end_date,
            conversion_time=600,
        )
        self.repo.execute_get_query.assert_called_once_with(result, self.parameters)

    def test_get_conversion_trend(self):
        self.repo.get_conversion_trend(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=self.start_date,
            end_date=self.end_date,
            conversion_time=600,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.trends_query_with_date_filter, self.parameters
        )

    def test_build_users_query(self):
        assert self.repo.build_users_query(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=None,
            end_date=None,
            conversion_time=600,
        ) == (
            self.users_query,
            self.parameters,
        )

    def test_build_trends_query(self):
        assert self.repo.build_trends_query(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=self.start_date,
            end_date=self.end_date,
            conversion_time=600,
        ) == (
            self.trends_query_with_date_filter,
            self.parameters,
        )

    def test_build_analytics_query(self):
        assert self.repo.build_analytics_query(
            ds_id=self.datasource_id,
            steps=self.steps,
            status=ConversionStatus.CONVERTED,
            start_date=None,
            end_date=None,
            conversion_time=600,
        ) == (self.analytics_query, self.parameters)
