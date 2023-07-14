from textwrap import dedent
from unittest.mock import MagicMock

from pypika import Table, Parameter, ClickHouseQuery, AliasedQuery

from domain.edge.models import TrendType, SankeyDirection
from repositories.clickhouse.edges import Edges


class TestEdgeRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Edges(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.table = Table("events")
        self.repo = repo
        self.datasource_id = "test-id"
        self.event_name = "test"
        self.start_date = "2022-01-01"
        self.end_date = "2023-01-01"
        self.criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.event_name == Parameter("%(event_name)s"),
        ]
        self.parameters = {
            "ds_id": "test-id",
            "event_name": "test",
            "start_date": "2022-01-01",
            "end_date": "2023-01-01",
        }
        self.edges_parameters = {
            "ds_id": "test-id",
            "end_date": "2023-01-01",
            "start_date": "2022-01-01",
        }
        self.edges_query = (
            'WITH cte AS (SELECT "user_id",any("event_name") OVER(PARTITION BY "user_id" '
            'ORDER BY "timestamp" ROWS BETWEEN 1 PRECEDING AND 0 PRECEDING) AS '
            '"prev_event","event_name" AS "curr_event" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s AND "event_name" NOT LIKE \'%%/%%\' AND '
            "\"event_name\" NOT LIKE '%%?%%') SELECT "
            '"cte"."prev_event","cte"."curr_event",COUNT(DISTINCT "cte"."user_id") AS '
            '"users",COUNT(*) AS "hits" FROM cte GROUP BY 1,2 ORDER BY 3 DESC LIMIT 100'
        )
        self.significance_query = (
            'WITH event AS (SELECT COUNT("user_id") AS "hits",COUNT(DISTINCT "user_id") '
            'AS "users" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            '"event_name"=%(event_name)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s) ,total AS (SELECT COUNT("user_id") AS '
            '"hits",COUNT(DISTINCT "user_id") AS "users" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s) SELECT '
            '"event"."users","total"."users","event"."hits","total"."hits" FROM '
            "event,total"
        )
        self.trends_query = (
            'SELECT EXTRACT(YEAR FROM "timestamp"),date("timestamp"),COUNT(DISTINCT '
            '"user_id") AS "users",COUNT(*) AS "hits",MIN("timestamp") AS '
            '"start_date",MAX("timestamp") AS "end_date" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND "event_name"=%(event_name)s AND '
            'DATE("timestamp")>=%(start_date)s AND DATE("timestamp")<=%(end_date)s GROUP '
            "BY 1,2 ORDER BY 2,1"
        )
        self.sankey_query = (
            'WITH cte AS (SELECT "user_id",any("event_name") OVER(PARTITION BY "user_id" '
            'ORDER BY "timestamp" ROWS BETWEEN 1 PRECEDING AND 0 PRECEDING) AS '
            '"prev_event","event_name" AS "curr_event" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            "DATE(\"timestamp\")<=%(end_date)s) SELECT 'inflow' AS "
            '"direction","cte"."prev_event","cte"."curr_event",COUNT(*) AS '
            '"hits",COUNT(DISTINCT "user_id") AS "users" FROM cte WHERE '
            '"cte"."curr_event"=%(event_name)s AND "cte"."prev_event"<>%(event_name)s '
            "GROUP BY 1,2,3 ORDER BY 4 DESC UNION ALL WITH cte AS (SELECT "
            '"user_id",any("event_name") OVER(PARTITION BY "user_id" ORDER BY "timestamp" '
            'ROWS BETWEEN 1 PRECEDING AND 0 PRECEDING) AS "prev_event","event_name" AS '
            '"curr_event" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            'DATE("timestamp")>=%(start_date)s AND DATE("timestamp")<=%(end_date)s) '
            "SELECT 'outflow' AS "
            '"direction","cte"."prev_event","cte"."curr_event",COUNT(*) AS '
            '"hits",COUNT(DISTINCT "user_id") AS "users" FROM cte WHERE '
            '"cte"."curr_event"<>%(event_name)s AND "cte"."prev_event"=%(event_name)s '
            "GROUP BY 1,2,3 ORDER BY 4 DESC"
        )

    def test_get_edges(self):
        self.repo.get_edges(
            ds_id=self.datasource_id,
            start_date=self.start_date,
            end_date=self.end_date,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.edges_query, self.edges_parameters
        )

    def test_build_edges_query(self):
        assert self.repo.build_edges_query(
            ds_id=self.datasource_id,
            start_date=self.start_date,
            end_date=self.end_date,
        ) == (self.edges_query, self.edges_parameters)

    def test_get_node_significance(self):
        self.repo.get_node_significance(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.significance_query, self.parameters
        )

    def test_build_node_significance_query(self):
        assert self.repo.build_node_significance_query(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
        ) == (self.significance_query, self.parameters)

    def test_get_node_trends(self):
        self.repo.get_node_trends(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
            trend_type=TrendType.DATE.value,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.trends_query, self.parameters
        )

    def test_build_node_trends_query(self):
        assert self.repo.build_node_trends_query(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
            trend_type=TrendType.DATE.value,
        ) == (self.trends_query, self.parameters)

    def test_get_node_sankey(self):
        self.repo.get_node_sankey(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
        )
        self.repo.execute_get_query.assert_called_once_with(
            self.sankey_query, self.parameters
        )

    def test_build_node_sankey_query(self):
        assert self.repo.build_node_sankey_query(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
        ) == (self.sankey_query, self.parameters)

    def test_get_parameters(self):
        assert {
            "ds_id": self.datasource_id,
            "event_name": self.event_name,
            "start_date": self.start_date,
            "end_date": self.end_date,
        } == self.repo.get_parameters(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
        )

    def test__build_significance_subquery(self):
        assert (
            'SELECT COUNT("user_id") AS "hits",COUNT(DISTINCT "user_id") AS "users" FROM '
            '"events" WHERE "datasource_id"=%(ds_id)s AND "event_name"=%(event_name)s'
        ) == self.repo._build_significance_subquery(criterion=self.criterion).get_sql()

    def test__build_sankey_subquery(self):
        assert (
            'SELECT "user_id",any("event_name") OVER(PARTITION BY "user_id" ORDER BY '
            '"timestamp" ROWS BETWEEN 1 PRECEDING AND 0 PRECEDING) AS '
            '"prev_event","event_name" AS "curr_event" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            'DATE("timestamp")<=%(end_date)s AND "datasource_id"=%(ds_id)s AND '
            '"event_name"=%(event_name)s'
        ) == self.repo._build_sankey_subquery(extra_criterion=self.criterion).get_sql()

    def test__sankey_direction_query(self):
        query = ClickHouseQuery
        sub_query = self.repo._build_sankey_subquery()

        cte_name = "cte"
        query = query.with_(sub_query, cte_name)
        cte = AliasedQuery(cte_name)
        query = query.from_(cte)

        assert (
            'WITH cte AS (SELECT "user_id",any("event_name") OVER(PARTITION BY "user_id" '
            'ORDER BY "timestamp" ROWS BETWEEN 1 PRECEDING AND 0 PRECEDING) AS '
            '"prev_event","event_name" AS "curr_event" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=%(start_date)s AND '
            "DATE(\"timestamp\")<=%(end_date)s) SELECT 'inflow' AS "
            '"direction","cte"."prev_event","cte"."curr_event",COUNT(*) AS '
            '"hits",COUNT(DISTINCT "user_id") AS "users" FROM cte WHERE '
            '"cte"."curr_event"=%(event_name)s AND "cte"."prev_event"<>%(event_name)s '
            "GROUP BY 1,2,3 ORDER BY 4 DESC"
        ) == self.repo._sankey_direction_query(
            query=query, cte=cte, direction=SankeyDirection.INFLOW
        ).get_sql()
