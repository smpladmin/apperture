from copy import deepcopy
from typing import List, Union

from pypika import (
    AliasedQuery,
    ClickHouseQuery,
    Criterion,
    CustomFunction,
    DatePart,
    Order,
    Parameter,
)
from pypika import analytics as an
from pypika import functions as fn
from pypika import terms

from domain.edge.models import SankeyDirection
from repositories.clickhouse.base import EventsBase


class Any(an.WindowFrameAnalyticFunction):
    def __init__(self, column: str):
        super().__init__("any", column)


class Edges(EventsBase):
    @staticmethod
    def get_parameters(ds_id: str, event_name: str, start_date: str, end_date: str):
        return {
            "ds_id": ds_id,
            "event_name": event_name,
            "start_date": start_date,
            "end_date": end_date,
        }

    async def get_edges(self, ds_id: str, start_date: str, end_date: str, app_id: str):
        return await self.execute_query_for_app(
            app_id=app_id, *self.build_edges_query(ds_id, start_date, end_date)
        )

    def build_edges_query(self, ds_id: str, start_date: str, end_date: str):
        extra_criterion = [
            self.table.event_name.not_like("%%/%%"),
            self.table.event_name.not_like("%%?%%"),
        ]
        sub_query = self._build_sankey_subquery(extra_criterion=extra_criterion)

        cte_name = "cte"
        query = ClickHouseQuery
        query = query.with_(sub_query, cte_name)
        cte = AliasedQuery(cte_name)
        query = (
            query.from_(cte)
            .select(
                cte.prev_event,
                cte.curr_event,
                fn.Count(cte.user_id).distinct().as_("users"),
                fn.Count("*").as_("hits"),
            )
            .groupby(1, 2)
            .orderby(3, order=Order.desc)
            .limit(100)
        )

        return query.get_sql(), {
            "ds_id": ds_id,
            "start_date": start_date,
            "end_date": end_date,
        }

    async def get_node_significance(
        self, ds_id: str, event_name: str, start_date: str, end_date: str, app_id: str
    ):
        return await self.execute_query_for_app(
            app_id=app_id,
            *self.build_node_significance_query(
                ds_id, event_name, start_date, end_date
            ),
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

    async def get_node_trends(
        self,
        ds_id: str,
        event_name: str,
        start_date: str,
        end_date: str,
        trend_type: str,
        app_id: str,
    ):
        return await self.execute_query_for_app(
            app_id=app_id,
            *self.build_node_trends_query(
                ds_id, event_name, start_date, end_date, trend_type
            ),
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

    async def get_node_sankey(
        self, ds_id: str, event_name: str, start_date: str, end_date: str, app_id: str
    ):
        return await self.execute_query_for_app(
            app_id=app_id,
            *self.build_node_sankey_query(ds_id, event_name, start_date, end_date),
        )

    def _build_sankey_subquery(self, extra_criterion: Union[List, None] = None):
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
        criterion = deepcopy(self.total_criterion)
        if extra_criterion:
            criterion.extend(extra_criterion)
        sub_query = sub_query.where(Criterion.all(criterion))
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
