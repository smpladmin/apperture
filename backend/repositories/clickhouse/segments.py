import logging
from operator import eq, ge, gt, le, lt, ne
from typing import List
from fastapi import Depends
from clickhouse.clickhouse import Clickhouse
from domain.segments.models import SegmentFilter
from pypika import ClickHouseQuery, Table, Parameter, Case, Order, Field
from pypika import functions as fn


class Segments:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse
        self.events = Table("events")
        self.operator_map = {
            "le": le,
            "ge": ge,
            "gt": gt,
            "lt": lt,
            "eq": eq,
            "ne": ne,
        }

    def get_segment(self, datasource_id: str, filters: List[SegmentFilter]):
        query, params = self.build_segment_query(datasource_id, filters)
        logging.info(f"Executing query: {query}")
        query_result = self.clickhouse.client.query(query=query, parameters=params)
        return query_result.result_set

    def build_segment_query(self, datasource_id: str, filters: List[SegmentFilter]):
        params = {f"event{i}": f.event for i, f in enumerate(filters)}
        params["ds_id"] = datasource_id
        query = (
            ClickHouseQuery.select(self.events.user_id)
            .from_(self.events)
            .where(
                self.events.datasource_id == Parameter("%(ds_id)s"),
            )
            .groupby(self.events.user_id)
            .limit(100)
        )
        if filters:
            query = self._add_filters(query, filters)
        return query.get_sql(), params

    def _add_filters(self, query: ClickHouseQuery, filters: List[SegmentFilter]):
        query = self._add_selects_for_filters(query, filters)
        query = self._add_operators_for_filters(query, filters)
        query = query.orderby("event0", order=Order.desc)
        return query

    def _add_operators_for_filters(
        self,
        query: ClickHouseQuery,
        filters: List[SegmentFilter],
    ):
        for i, filter in enumerate(filters):
            if filter.operator:
                operator = self.operator_map[filter.operator]
                query = query.having(operator(Field(f"event{i}"), filter.operand))
        return query

    def _add_selects_for_filters(
        self,
        query: ClickHouseQuery,
        filters: List[SegmentFilter],
    ):
        for i, _ in enumerate(filters):
            query = query.select(
                fn.Count(
                    Case().when(
                        self.events.event_name == Parameter(f"%(event{i})s"), 1
                    ),
                ).as_(f"event{i}")
            )

        return query
