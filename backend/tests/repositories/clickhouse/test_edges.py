from textwrap import dedent
from unittest.mock import MagicMock
from repositories.clickhouse.edges import Edges


class TestEdgeRepository:
    def test_get_edges(self):
        clickhouse = MagicMock()
        repo = Edges(clickhouse)
        datasource_id = "test-id"

        repo.get_edges(datasource_id)

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
        assert {"ds_id": datasource_id} == query_args["parameters"]
