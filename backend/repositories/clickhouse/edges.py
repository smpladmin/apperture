from typing import List
from textwrap import dedent

from pypika import (
    ClickHouseQuery,
    Criterion,
    Parameter,
    functions as fn,
    AliasedQuery,
    CustomFunction,
)
from repositories.clickhouse.events import Events


class Edges(Events):
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
        return self.execute_get_query(query, parameters={"ds_id": ds_id})

    def get_node_significance(
        self, ds_id: str, event_name: str, start_date: str, end_date: str
    ):
        return self.execute_get_query(
            *self.build_node_significance_query(ds_id, event_name, start_date, end_date)
        )

    def _build_subquery(self, criterion: List):
        return (
            ClickHouseQuery.from_(self.table)
            .select(
                fn.Count(self.table.user_id).as_("hits"),
                fn.Count(self.table.user_id).distinct().as_("users"),
            )
            .where(Criterion.all(criterion))
        )

    def build_node_significance_query(
        self, ds_id: str, event_name: str, start_date: str, end_date: str
    ):
        date_func = CustomFunction("DATE", ["timestamp"])
        parameters = {"ds_id": ds_id, "event_name": event_name}
        query = ClickHouseQuery
        total_criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            date_func(self.table.timestamp) >= start_date,
            date_func(self.table.timestamp) <= end_date,
        ]
        event_criterion = [
            self.table.datasource_id == Parameter("%(ds_id)s"),
            self.table.event_name == Parameter("%(event_name)s"),
            date_func(self.table.timestamp) >= start_date,
            date_func(self.table.timestamp) <= end_date,
        ]
        event = self._build_subquery(criterion=event_criterion)
        total = self._build_subquery(criterion=total_criterion)

        query = query.with_(event, "event").with_(total, "total")
        query = query.from_(AliasedQuery("event")).from_(AliasedQuery("total"))
        query = query.select(
            AliasedQuery("event").users,
            AliasedQuery("total").users,
            AliasedQuery("event").hits,
            AliasedQuery("total").hits,
        )
        return query.get_sql(with_alias=True), parameters
