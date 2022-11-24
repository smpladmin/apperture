from textwrap import dedent
from unittest.mock import MagicMock
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
        self.parameters = {"ds_id": "test-id", "event_name": "test"}
        self.query = (
            'WITH event AS (SELECT COUNT("user_id") AS "hits",COUNT(DISTINCT "user_id") '
            'AS "users" FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
            '"event_name"=%(event_name)s AND DATE("timestamp")>=\'2022-01-01\' AND '
            'DATE("timestamp")<=\'2023-01-01\') ,total AS (SELECT COUNT("user_id") AS '
            '"hits",COUNT(DISTINCT "user_id") AS "users" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=\'2022-01-01\' AND '
            "DATE(\"timestamp\")<='2023-01-01') SELECT "
            '"event"."users","total"."users","event"."hits","total"."hits" FROM '
            "event,total"
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
        self.repo.execute_get_query.assert_called_once_with(self.query, self.parameters)

    def test_build_node_significance_query(self):
        assert self.repo.build_node_significance_query(
            ds_id=self.datasource_id,
            event_name=self.event_name,
            start_date=self.start_date,
            end_date=self.end_date,
        ) == (self.query, self.parameters)
