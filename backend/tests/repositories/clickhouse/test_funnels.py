from unittest.mock import MagicMock
from pypika import (
    ClickHouseQuery,
    Table,
    Criterion,
    functions as fn,
    Parameter,
    AliasedQuery,
    Case,
    NULL,
    DatePart,
    Field,
)
from pypika.functions import Extract
from domain.funnels.models import FunnelStep, ConversionStatus
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
            FunnelStep(event="Download_Video", filters=[]),
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
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s GROUP BY 1) SELECT '
            'COUNT(DISTINCT "table1"."user_id"),COUNT(CASE WHEN EXTRACT(YEAR FROM '
            '"table1"."ts")>%(epoch_year)s AND "table2"."ts">"table1"."ts" THEN '
            '"table2"."user_id" ELSE NULL END),COUNT(CASE WHEN EXTRACT(YEAR FROM '
            '"table2"."ts")>%(epoch_year)s AND "table3"."ts">"table2"."ts" AND '
            '"table2"."ts">"table1"."ts" THEN "table3"."user_id" ELSE NULL END) FROM '
            'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
            'table3 ON "table1"."user_id"="table3"."user_id"'
        )
        self.trends_query = (
            'WITH table1 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" '
            'WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event0)s GROUP BY 1) '
            ',table2 AS (SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event1)s GROUP BY 1) ,table3 AS '
            '(SELECT "user_id",MIN("timestamp") AS "ts" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event2)s GROUP BY 1) SELECT '
            'WEEK("table1"."ts"),EXTRACT(YEAR FROM "table1"."ts"),COUNT(CASE WHEN '
            'EXTRACT(YEAR FROM "table2"."ts")>%(epoch_year)s AND '
            '"table2"."ts">="table1"."ts" AND "table3"."ts">="table2"."ts" THEN '
            '"table3"."user_id" ELSE NULL END),COUNT(DISTINCT "table1"."user_id") FROM '
            'table1 LEFT JOIN table2 ON "table1"."user_id"="table2"."user_id" LEFT JOIN '
            'table3 ON "table1"."user_id"="table3"."user_id" GROUP BY 1,2 ORDER BY 2,1'
        )
        self.table = Table("events")

        self.analytics_query = (
            ClickHouseQuery.with_(
                ClickHouseQuery.from_(self.table)
                .select(
                    self.table.user_id,
                    fn.Min(self.table.timestamp).as_("ts"),
                )
                .where(
                    Criterion.all(
                        [
                            self.table.datasource_id == Parameter("%(ds_id)s"),
                            self.table.event_name == Parameter("%(event0)s"),
                        ]
                    )
                )
                .groupby(1),
                "table1",
            )
            .with_(
                ClickHouseQuery.from_(self.table)
                .select(
                    self.table.user_id,
                    fn.Min(self.table.timestamp).as_("ts"),
                )
                .where(
                    Criterion.all(
                        [
                            self.table.datasource_id == Parameter("%(ds_id)s"),
                            self.table.event_name == Parameter("%(event1)s"),
                        ]
                    )
                )
                .groupby(1),
                "table2",
            )
            .with_(
                ClickHouseQuery.from_(self.table)
                .select(
                    self.table.user_id,
                    fn.Min(self.table.timestamp).as_("ts"),
                )
                .where(
                    Criterion.all(
                        [
                            self.table.datasource_id == Parameter("%(ds_id)s"),
                            self.table.event_name == Parameter("%(event2)s"),
                        ]
                    )
                )
                .groupby(1),
                "table3",
            )
            .with_(
                ClickHouseQuery.from_(AliasedQuery("table1"))
                .select(
                    AliasedQuery("table1").user_id.as_(0),
                    Case()
                    .when(
                        Criterion.all(
                            [
                                Extract(DatePart.year, AliasedQuery("table1").ts)
                                > Parameter("%(epoch_year)s"),
                                AliasedQuery("table2").ts > AliasedQuery("table1").ts,
                            ]
                        ),
                        AliasedQuery("table2").user_id,
                    )
                    .else_(NULL)
                    .as_(1),
                    Case()
                    .when(
                        Criterion.all(
                            [
                                Extract(DatePart.year, AliasedQuery("table2").ts)
                                > Parameter("%(epoch_year)s"),
                                AliasedQuery("table3").ts > AliasedQuery("table2").ts,
                                AliasedQuery("table2").ts > AliasedQuery("table1").ts,
                            ]
                        ),
                        AliasedQuery("table3").user_id,
                    )
                    .else_(NULL)
                    .as_(2),
                )
                .left_join(AliasedQuery("table2"))
                .on_field("user_id")
                .left_join(AliasedQuery("table3"))
                .on_field("user_id"),
                "final_table",
            )
        )

        self.analytics_query = (
            self.analytics_query.from_(AliasedQuery("final_table"))
            .select(
                Field("1"),
                Case()
                .when(Field("2") != "null", ConversionStatus.CONVERTED)
                .else_(ConversionStatus.DROPPED)
                .as_("2"),
            )
            .where(Field(1) != "null")
            .orderby(2)
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

    def test_build_analytics_query(self):
        query, parameter, last, second_last = self.repo.build_analytics_query(
            ds_id=self.datasource_id, steps=self.steps
        )
        assert query.get_sql() == self.analytics_query.get_sql()
        assert parameter == self.parameters
        assert last == 2
        assert second_last == 1
