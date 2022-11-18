from textwrap import dedent
from fastapi import Depends

from clickhouse.clickhouse import Clickhouse


class Edges:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = "events"

    def get_edges(self, ds_id: str):
        query = dedent(
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
        res = self.clickhouse.client.query(query=query, parameters={"ds_id": ds_id})
        return res.result_set
