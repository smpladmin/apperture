from textwrap import dedent
from unittest.mock import MagicMock

from domain.edge.models import TrendType
from repositories.clickhouse.edges import Edges


class TestEdgeRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Edges(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "test-id"
        self.event_name = "test"
        self.start_date = "2022-01-01"
        self.end_date = "2023-01-01"
        self.parameters = {
            "ds_id": "test-id",
            "end_date": "2023-01-01",
            "event_name": "test",
            "start_date": "2022-01-01",
        }
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

    def test_get_edges(self):
        clickhouse = MagicMock()
        repo = Edges(clickhouse)
        repo.get_edges(self.datasource_id)

        query_args = clickhouse.client.query.call_args.kwargs
        assert (
            dedent(
                """
            select 
              previous_event, 
              event_name as current_event, 
              count(distinct user_id) as users,
              count(*) as hits
            from
            (
                select 
                  user_id, 
                  any(event_name) over (
                    partition by user_id
                    order by 
                      toDateTime(timestamp) rows between 1 preceding and 0 preceding
                ) as previous_event, 
                event_name 
                from 
                  events 
                where 
                  datasource_id = %(ds_id)s 
                  and event_name not like '%%/%%'
                  and event_name not like '%%?%%'
            )
            group by 
              1, 
              2 
            order by 
              3 desc 
            limit 
              100
            """
            )
            == query_args["query"]
        )
        assert {"ds_id": self.datasource_id} == query_args["parameters"]

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
            trend_type=TrendType.DATE,
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
            trend_type=TrendType.DATE,
        ) == (self.trends_query, self.parameters)
