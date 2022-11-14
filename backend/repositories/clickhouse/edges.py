from fastapi import Depends

from clickhouse.clickhouse import Clickhouse
from domain.common.models import IntegrationProvider


class Edges:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.table = "events"

    def get_edges(self, ds_id: str, provider: IntegrationProvider):
        uid = (
            "properties.distinct_id" if provider == "mixpanel" else "properties.user_id"
        )
        query = f"""
        select 
          previous_event, 
          event_name as current_event, 
          count(distinct distinct_id) as users,
          count(*) as hits
        from
        (
            select 
              {uid} as distinct_id, 
              any(event_name) over (
                partition by {uid}
                order by 
                  toDateTime(timestamp) rows between 1 preceding and 0 preceding
            ) as previous_event, 
            event_name 
            from 
              default.events 
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
        res = self.clickhouse.client.query(query=query, parameters={"ds_id": ds_id})
        return res.result_set
