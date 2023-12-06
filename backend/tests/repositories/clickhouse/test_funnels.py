from unittest.mock import AsyncMock, MagicMock

import pytest
from pypika import ClickHouseQuery, Table

from domain.common.filter_models import FilterDataType, FilterOperatorsString
from domain.funnels.models import FunnelStep
from domain.segments.models import SegmentFilterConditions, WhereSegmentFilter
from repositories.clickhouse.funnels import ConversionStatus, Funnels


class TestFunnelsRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Funnels(self.clickhouse)
        self.repo = repo
        self.repo.execute_query_for_app = AsyncMock()
        self.datasource_id = "test-id"
        self.app_id = "test-app-id"
        self.steps = [
            FunnelStep(event="Video_Open", filters=[]),
            FunnelStep(event="Video_Seen", filters=[]),
            FunnelStep(
                event="Download_Video",
                filters=[
                    WhereSegmentFilter(
                        operator=FilterOperatorsString.IS,
                        operand="prop1",
                        values=[10],
                        all=False,
                        type=SegmentFilterConditions.WHERE,
                        condition=SegmentFilterConditions.WHERE,
                        datatype=FilterDataType.STRING,
                    )
                ],
            ),
        ]
        self.segment_filter_query = ClickHouseQuery.from_(self.repo.table).select("*")
        self.inclusion_criterion = True
        self.parameters = {
            "ds_id": self.datasource_id,
            "conversion_time": 600,
            "epoch_year": 1970,
            "event0": "Video_Open",
            "event1": "Video_Seen",
            "event2": "Download_Video",
        }
        self.users_query = (
            'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
            '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" IN '
            'segment_users GROUP BY 1) ,table2 AS (SELECT "user_id",MIN("timestamp") AS '
            '"ts" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            '"event_name"=%(event1)s AND "user_id" IN segment_users GROUP BY 1) ,table3 '
            'AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            'IN (10) AND "user_id" IN segment_users GROUP BY 1) SELECT COUNT(DISTINCT '
            '"table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
            '"table2"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
            'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table3"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
            '"table3"."user_id" ELSE NULL END) FROM table1 LEFT JOIN table2 ON '
            '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
            '"table2"."user_id"="table3"."user_id"'
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
            'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
            '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" IN '
            "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31') ,table2 AS (SELECT "
            '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s AND "user_id" IN '
            "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
            "DATE(\"timestamp\")<='2022-12-31') ,table3 AS (SELECT "
            '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            'IN (10) AND "user_id" IN segment_users GROUP BY 1 HAVING '
            "DATE(\"timestamp\")>='2022-12-01' AND DATE(\"timestamp\")<='2022-12-31') "
            'SELECT WEEK("table1"."ts"),EXTRACT(YEAR FROM "table1"."ts"),COUNT(CASE WHEN '
            'EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table2"."ts">="table1"."ts" AND "table3"."ts">="table2"."ts" THEN '
            '"table3"."user_id" ELSE NULL END),COUNT(DISTINCT "table1"."user_id") FROM '
            'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
            'table3 ON "table1"."user_id"="table3"."user_id" GROUP BY 1,2 ORDER BY 2,1'
        )
        self.anyorder_trends_query_with_date_filter = 'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1 HAVING DATE("timestamp")>=\'2022-12-01\' AND DATE("timestamp")<=\'2022-12-31\') ,table2 AS (SELECT * FROM (SELECT "user_id",MAX("timestamp") AS "ts" FROM "events" WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1 HAVING DATE("timestamp")>=\'2022-12-01\' AND DATE("timestamp")<=\'2022-12-31\') AS "sq0" JOIN table1 ON "sq0"."user_id"="table1"."user_id") ,table3 AS (SELECT * FROM (SELECT "user_id",MAX("timestamp") AS "ts" FROM "events" WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" IN (10) GROUP BY 1 HAVING DATE("timestamp")>=\'2022-12-01\' AND DATE("timestamp")<=\'2022-12-31\') AS "sq0" JOIN table2 ON "sq0"."user_id"="table2"."user_id") SELECT WEEK("table1"."ts"),EXTRACT(YEAR FROM "table1"."ts"),COUNT(CASE WHEN EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s AND "table2"."ts">="table1"."ts" AND "table3"."ts">="table2"."ts" THEN "table3"."user_id" ELSE NULL END),COUNT(DISTINCT "table1"."user_id") FROM table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON "table1"."user_id"="table3"."user_id" GROUP BY 1,2 ORDER BY 2,1'
        self.table = Table("events")
        self.start_date = "2022-12-01"
        self.end_date = "2022-12-31"
        self.analytics_query = (
            'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
            '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" IN '
            'segment_users GROUP BY 1) ,table2 AS (SELECT "user_id",MIN("timestamp") AS '
            '"ts" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            '"event_name"=%(event1)s AND "user_id" IN segment_users GROUP BY 1) ,table3 '
            'AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            'IN (10) AND "user_id" IN segment_users GROUP BY 1) ,final_table AS (SELECT '
            '"table1"."user_id" AS "0",CASE WHEN EXTRACT(YEAR FROM '
            '"table2"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL END AS '
            '"1",CASE WHEN EXTRACT(YEAR FROM "table3"."ts")>%(epoch_year)s AND '
            'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
            'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
            '"table3"."user_id" ELSE NULL END AS "2" FROM table1 LEFT JOIN table2 ON '
            '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
            '"table1"."user_id"="table3"."user_id") SELECT "1",(SELECT '
            'COUNT("2"),COUNT(DISTINCT "2") FROM final_table) FROM final_table WHERE NOT '
            '"2" IS NULL AND NOT "1" IS NULL LIMIT 100'
        )

    @pytest.mark.parametrize(
        "start_date, end_date, inclusion_criterion, result",
        [
            (
                None,
                None,
                True,
                (
                    'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" IN '
                    'segment_users GROUP BY 1) ,table2 AS (SELECT "user_id",MIN("timestamp") AS '
                    '"ts" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                    '"event_name"=%(event1)s AND "user_id" IN segment_users GROUP BY 1) ,table3 '
                    'AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
                    'IN (10) AND "user_id" IN segment_users GROUP BY 1) SELECT COUNT(DISTINCT '
                    '"table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
                    '"table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
                    'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table3"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
                    '"table3"."user_id" ELSE NULL END) FROM table1 LEFT JOIN table2 ON '
                    '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
                    '"table2"."user_id"="table3"."user_id"'
                ),
            ),
            (
                "2022-12-01",
                "2022-12-31",
                False,
                (
                    'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" NOT IN '
                    "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    "DATE(\"timestamp\")<='2022-12-31') ,table2 AS (SELECT "
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s AND "user_id" NOT IN '
                    "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    "DATE(\"timestamp\")<='2022-12-31') ,table3 AS (SELECT "
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
                    'IN (10) AND "user_id" NOT IN segment_users GROUP BY 1 HAVING '
                    "DATE(\"timestamp\")>='2022-12-01' AND DATE(\"timestamp\")<='2022-12-31') "
                    'SELECT COUNT(DISTINCT "table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
                    '"table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
                    'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table3"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
                    '"table3"."user_id" ELSE NULL END) FROM table1 LEFT JOIN table2 ON '
                    '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
                    '"table2"."user_id"="table3"."user_id"'
                ),
            ),
        ],
    )
    @pytest.mark.asyncio
    async def test_get_users_count(
        self, start_date, end_date, inclusion_criterion, result
    ):
        await self.repo.get_users_count(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=start_date,
            end_date=end_date,
            conversion_time=600,
            random_sequence=False,
            segment_filter_query=self.segment_filter_query,
            inclusion_criterion=inclusion_criterion,
            app_id=self.app_id,
        )
        self.repo.execute_query_for_app.assert_called_once_with(
            result, self.parameters, app_id=self.app_id
        )

    @pytest.mark.asyncio
    async def test_get_conversion_trend(self):
        await self.repo.get_conversion_trend(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=self.start_date,
            end_date=self.end_date,
            conversion_time=600,
            random_sequence=False,
            segment_filter_query=self.segment_filter_query,
            inclusion_criterion=self.inclusion_criterion,
            app_id=self.app_id,
        )
        self.repo.execute_query_for_app.assert_called_once_with(
            self.trends_query_with_date_filter,
            self.parameters,
            app_id=self.app_id,
        )

    def test_build_users_query(self):
        assert self.repo.build_users_query(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=None,
            end_date=None,
            conversion_time=600,
            random_sequence=False,
            segment_filter_query=self.segment_filter_query,
            inclusion_criterion=self.inclusion_criterion,
        ) == (
            self.users_query,
            self.parameters,
        )

    @pytest.mark.parametrize(
        "segment_filter_query, inclusion_criterion, result",
        [
            (
                ClickHouseQuery.from_("events").select("*"),
                True,
                (
                    'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" IN '
                    "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    "DATE(\"timestamp\")<='2022-12-31') ,table2 AS (SELECT "
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s AND "user_id" IN '
                    "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    "DATE(\"timestamp\")<='2022-12-31') ,table3 AS (SELECT "
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
                    'IN (10) AND "user_id" IN segment_users GROUP BY 1 HAVING '
                    "DATE(\"timestamp\")>='2022-12-01' AND DATE(\"timestamp\")<='2022-12-31') "
                    'SELECT WEEK("table1"."ts"),EXTRACT(YEAR FROM "table1"."ts"),COUNT(CASE WHEN '
                    'EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">="table1"."ts" AND "table3"."ts">="table2"."ts" THEN '
                    '"table3"."user_id" ELSE NULL END),COUNT(DISTINCT "table1"."user_id") FROM '
                    'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
                    'table3 ON "table1"."user_id"="table3"."user_id" GROUP BY 1,2 ORDER BY 2,1'
                ),
            ),
            (
                None,
                None,
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
                    'DATE("timestamp")<=\'2022-12-31\') SELECT WEEK("table1"."ts"),EXTRACT(YEAR '
                    'FROM "table1"."ts"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
                    '"table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">="table1"."ts" AND "table3"."ts">="table2"."ts" THEN '
                    '"table3"."user_id" ELSE NULL END),COUNT(DISTINCT "table1"."user_id") FROM '
                    'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
                    'table3 ON "table1"."user_id"="table3"."user_id" GROUP BY 1,2 ORDER BY 2,1'
                ),
            ),
        ],
    )
    def test_build_trends_query(
        self, segment_filter_query, inclusion_criterion, result
    ):
        assert self.repo.build_trends_query(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=self.start_date,
            end_date=self.end_date,
            conversion_time=600,
            random_sequence=False,
            segment_filter_query=segment_filter_query,
            inclusion_criterion=inclusion_criterion,
        ) == (
            result,
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
            random_sequence=False,
            segment_filter_query=self.segment_filter_query,
            inclusion_criterion=self.inclusion_criterion,
        ) == (self.analytics_query, self.parameters)

    @pytest.mark.parametrize(
        "start_date, end_date, inclusion_criterion, anyorder_result",
        [
            (
                None,
                None,
                True,
                (
                    'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" IN '
                    "segment_users GROUP BY 1) ,table2 AS (SELECT * FROM (SELECT "
                    '"user_id",MAX("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s AND "user_id" IN '
                    'segment_users GROUP BY 1) AS "sq0" JOIN table1 ON '
                    '"sq0"."user_id"="table1"."user_id") ,table3 AS (SELECT * FROM (SELECT '
                    '"user_id",MAX("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
                    'IN (10) AND "user_id" IN segment_users GROUP BY 1) AS "sq0" JOIN table2 ON '
                    '"sq0"."user_id"="table2"."user_id") SELECT COUNT(DISTINCT '
                    '"table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
                    '"table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
                    'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table3"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table3"."ts">"table1"."ts" THEN "table3"."user_id" ELSE NULL END) FROM '
                    'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
                    'table3 ON "table2"."user_id"="table3"."user_id"'
                ),
            ),
            (
                "2022-12-01",
                "2022-12-31",
                False,
                (
                    'WITH segment_users AS (SELECT * FROM "events") ,table1 AS (SELECT '
                    '"user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event0)s AND "user_id" NOT IN '
                    "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    "DATE(\"timestamp\")<='2022-12-31') ,table2 AS (SELECT * FROM (SELECT "
                    '"user_id",MAX("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s AND "user_id" NOT IN '
                    "segment_users GROUP BY 1 HAVING DATE(\"timestamp\")>='2022-12-01' AND "
                    'DATE("timestamp")<=\'2022-12-31\') AS "sq0" JOIN table1 ON '
                    '"sq0"."user_id"="table1"."user_id") ,table3 AS (SELECT * FROM (SELECT '
                    '"user_id",MAX("timestamp") AS "ts" FROM "events" WHERE '
                    '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
                    'IN (10) AND "user_id" NOT IN segment_users GROUP BY 1 HAVING '
                    "DATE(\"timestamp\")>='2022-12-01' AND DATE(\"timestamp\")<='2022-12-31') AS "
                    '"sq0" JOIN table2 ON "sq0"."user_id"="table2"."user_id") SELECT '
                    'COUNT(DISTINCT "table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
                    '"table2"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table2"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
                    'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table3"."ts")>%(epoch_year)s AND '
                    'toUnixTimestamp("table3"."ts")-toUnixTimestamp("table1"."ts")<=%(conversion_time)s '
                    'AND "table3"."ts">"table1"."ts" THEN "table3"."user_id" ELSE NULL END) FROM '
                    'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
                    'table3 ON "table2"."user_id"="table3"."user_id"'
                ),
            ),
        ],
    )
    @pytest.mark.asyncio
    async def test_get_anyorder_users_count(
        self, start_date, end_date, inclusion_criterion, anyorder_result
    ):
        await self.repo.get_users_count(
            ds_id=self.datasource_id,
            steps=self.steps,
            app_id=self.app_id,
            start_date=start_date,
            end_date=end_date,
            conversion_time=600,
            random_sequence=True,
            segment_filter_query=self.segment_filter_query,
            inclusion_criterion=inclusion_criterion,
        )
        self.repo.execute_query_for_app.assert_called_once_with(
            anyorder_result, self.parameters, app_id=self.app_id
        )

    @pytest.mark.asyncio
    async def test_get_anyorder_conversion_trend(self):
        await self.repo.get_conversion_trend(
            ds_id=self.datasource_id,
            steps=self.steps,
            start_date=self.start_date,
            end_date=self.end_date,
            conversion_time=600,
            random_sequence=True,
            segment_filter_query=None,
            inclusion_criterion=None,
            app_id=self.app_id,
        )
        self.repo.execute_query_for_app.assert_called_once_with(
            self.anyorder_trends_query_with_date_filter,
            self.parameters,
            app_id=self.app_id,
        )
