from unittest.mock import MagicMock

from domain.funnels.models import FunnelStep
from domain.segments.models import (
    WhereSegmentFilter,
    SegmentFilterOperatorsString,
    SegmentFilterConditions,
    SegmentDataType,
)
from repositories.clickhouse.funnels import Funnels


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
            '"table2"."ts">"table1"."ts" THEN "table2"."user_id" ELSE NULL '
            'END),COUNT(CASE WHEN EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
            '"table3"."ts">"table2"."ts" AND "table2"."ts">"table1"."ts" THEN '
            '"table3"."user_id" ELSE NULL END) FROM table1 LEFT JOIN table2 ON '
            '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
            '"table1"."user_id"="table3"."user_id"'
        )

        self.trends_query = (
            'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1) '
            ',table2 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1) ,table3 AS '
            '(SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s AND "properties.prop1" '
            'IN (10) GROUP BY 1) SELECT WEEK("table1"."ts"),EXTRACT(YEAR FROM '
            '"table1"."ts"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
            '"table2"."ts")>%(epoch_year)s AND "table2"."ts">="table1"."ts" AND '
            '"table3"."ts">="table2"."ts" THEN "table3"."user_id" ELSE NULL '
            'END),COUNT(DISTINCT "table1"."user_id") FROM table1 LEFT JOIN table2 ON '
            '"table1"."user_id"="table2"."user_id" LEFT JOIN table3 ON '
            '"table1"."user_id"="table3"."user_id" GROUP BY 1,2 ORDER BY 2,1'
        )

    def test_get_users_count(self):
        self.repo.get_users_count(ds_id=self.datasource_id, steps=self.steps)
        self.repo.execute_get_query.assert_called_once_with(
            self.users_query, self.parameters
        )

    def test_get_conversion_trend(self):
        self.repo.get_conversion_trend(ds_id=self.datasource_id, steps=self.steps)
        self.repo.execute_get_query.assert_called_once_with(
            self.trends_query, self.parameters
        )

    def test_build_users_query(self):
        assert self.repo.build_users_query(
            ds_id=self.datasource_id, steps=self.steps
        ) == (
            self.users_query,
            self.parameters,
        )

    def test_build_trends_query(self):
        assert self.repo.build_trends_query(
            ds_id=self.datasource_id, steps=self.steps
        ) == (
            self.trends_query,
            self.parameters,
        )
