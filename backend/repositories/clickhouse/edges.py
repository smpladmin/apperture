from typing import List
from textwrap import dedent

from pypika import (
    ClickHouseQuery,
    Criterion,
    functions as fn,
    AliasedQuery,
    CustomFunction,
    DatePart,
)
from pypika.functions import Extract

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
        parameters = {
            "ds_id": ds_id,
            "event_name": event_name,
            "start_date": start_date,
            "end_date": end_date,
        }
        query = ClickHouseQuery
        event = self._build_subquery(criterion=self.event_criterion)
        total = self._build_subquery(criterion=self.total_criterion)

        query = query.with_(event, "event").with_(total, "total")
        query = query.from_(AliasedQuery("event")).from_(AliasedQuery("total"))
        query = query.select(
            AliasedQuery("event").users,
            AliasedQuery("total").users,
            AliasedQuery("event").hits,
            AliasedQuery("total").hits,
        )
        return query.get_sql(with_alias=True), parameters

    def get_node_trends(
        self,
        ds_id: str,
        event_name: str,
        start_date: str,
        end_date: str,
        trend_type: str,
    ):
        return self.execute_get_query(
            *self.build_node_trends_query(
                ds_id, event_name, start_date, end_date, trend_type
            )
        )

    def build_node_trends_query(
        self,
        ds_id: str,
        event_name: str,
        start_date: str,
        end_date: str,
        trend_type: str,
    ):
        parameters = {
            "ds_id": ds_id,
            "event_name": event_name,
            "start_date": start_date,
            "end_date": end_date,
        }
        trend_type_func = CustomFunction(f"{trend_type}", ["timestamp"])
        query = ClickHouseQuery.from_(self.table)
        query = (
            query.select(
                Extract(DatePart.year, self.table.timestamp),
                trend_type_func(self.table.timestamp),
                fn.Count(self.table.user_id).distinct().as_("users"),
                fn.Count("*").as_("hits"),
                fn.Min(self.table.timestamp).as_("start_date"),
                fn.Max(self.table.timestamp).as_("end_date"),
            )
            .where(Criterion.all(self.event_criterion))
            .groupby(1, 2)
            .orderby(2, 1)
        )

        return query.get_sql(with_alias=True), parameters
