from enum import Enum
from typing import List
from textwrap import dedent

from pypika import (
    ClickHouseQuery,
    Criterion,
    functions as fn,
    analytics as an,
    AliasedQuery,
    CustomFunction,
    DatePart,
    Order,
    terms,
    Parameter,
)

from repositories.clickhouse.events import Events


class Any(an.WindowFrameAnalyticFunction):
    def __init__(self, column: str):
        super().__init__("any", column)


class SankeyDirection(Enum):
    INFLOW = "inflow"
    OUTFLOW = "outflow"


class Edges(Events):
    @staticmethod
    def get_parameters(ds_id: str, event_name: str, start_date: str, end_date: str):
        return {
            "ds_id": ds_id,
            "event_name": event_name,
            "start_date": start_date,
            "end_date": end_date,
        }

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

    def _build_significance_subquery(self, criterion: List):
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
        query = ClickHouseQuery
        event = self._build_significance_subquery(criterion=self.event_criterion)
        total = self._build_significance_subquery(criterion=self.total_criterion)

        query = query.with_(event, "event").with_(total, "total")
        query = query.from_(AliasedQuery("event")).from_(AliasedQuery("total"))
        query = query.select(
            AliasedQuery("event").users,
            AliasedQuery("total").users,
            AliasedQuery("event").hits,
            AliasedQuery("total").hits,
        )
        return query.get_sql(with_alias=True), Edges.get_parameters(
            ds_id, event_name, start_date, end_date
        )

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
        trend_type_func = CustomFunction(f"{trend_type}", ["timestamp"])
        query = ClickHouseQuery.from_(self.table)
        query = (
            query.select(
                fn.Extract(DatePart.year, self.table.timestamp),
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

        return query.get_sql(with_alias=True), Edges.get_parameters(
            ds_id, event_name, start_date, end_date
        )

    def get_node_sankey(
        self, ds_id: str, event_name: str, start_date: str, end_date: str
    ):
        return self.execute_get_query(
            *self.build_node_sankey_query(ds_id, event_name, start_date, end_date)
        )

    def _build_sankey_subquery(self):
        sub_query = ClickHouseQuery
        sub_query = sub_query.from_(self.table)
        prev_event = (
            Any(self.table.event_name)
            .over(self.table.user_id)
            .orderby(self.table.timestamp)
            .rows(an.Preceding("1"), an.Preceding("0"))
        )
        sub_query = sub_query.select(
            self.table.user_id,
            prev_event.as_("prev_event"),
            self.table.event_name.as_("curr_event"),
        )
        sub_query = sub_query.where(Criterion.all(self.total_criterion))
        return sub_query

    def _sankey_direction_query(
        self, query: ClickHouseQuery, cte: AliasedQuery, direction: SankeyDirection
    ):
        query = query.select(
            terms.Term.wrap_constant(direction).as_("direction"),
            cte.prev_event,
            cte.curr_event,
            fn.Count("*").as_("hits"),
            fn.Count(self.table.user_id).distinct().as_("users"),
        )

        criterion = (
            [
                cte.curr_event == Parameter("%(event_name)s"),
                cte.prev_event != Parameter("%(event_name)s"),
            ]
            if direction == SankeyDirection.INFLOW
            else [
                cte.curr_event != Parameter("%(event_name)s"),
                cte.prev_event == Parameter("%(event_name)s"),
            ]
        )
        query = (
            query.where(Criterion.all(criterion))
            .groupby(1, 2, 3)
            .orderby(4, order=Order.desc)
        )
        return query

    def build_node_sankey_query(
        self, ds_id: str, event_name: str, start_date: str, end_date: str
    ):
        query, query1 = ClickHouseQuery, ClickHouseQuery
        sub_query = self._build_sankey_subquery()

        cte_name = "cte"
        query = query.with_(sub_query, cte_name)
        cte = AliasedQuery(cte_name)

        query = query.from_(cte)
        inflow_query = self._sankey_direction_query(
            query=query, cte=cte, direction=SankeyDirection.INFLOW
        )
        outflow_query = self._sankey_direction_query(
            query=query, cte=cte, direction=SankeyDirection.OUTFLOW
        )
        query = inflow_query.union_all(outflow_query)
        return query.get_sql(), Edges.get_parameters(
            ds_id, event_name, start_date, end_date
        )
