import logging
from typing import List, Optional, Union

from fastapi import Depends
from pypika import Case, ClickHouseQuery, Criterion, Field, Parameter
from pypika import functions as fn

from clickhouse.clickhouse import Clickhouse
from domain.spreadsheets.models import (
    ColumnFilter,
    ColumnFilterOperators,
    DimensionDefinition,
    Formula,
    MetricDefinition,
)
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.parser.query_parser import QueryParser


class Spreadsheets(EventsBase):
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
        parser: QueryParser = Depends(),
    ):
        super().__init__(clickhouse=clickhouse)
        self.clickhouse = clickhouse
        self.parser = parser

    def get_transient_spreadsheet(
        self,
        query: str,
        username: Union[str, None],
        password: Union[str, None],
    ):
        query = self.parser.assign_query_limit(query)
        restricted_client = self.clickhouse.get_connection_for_user(
            username=username, password=password
        )
        result = restricted_client.query(query=query)
        logging.info(query)
        restricted_client.close()
        return result

    def get_transient_columns(
        self,
        datasource_id: str,
        dimensions: List[DimensionDefinition],
        metric: Union[MetricDefinition, None],
    ):
        self.execute_get_query(
            *self.build_transient_columns_query(datasource_id, dimensions, metric)
        )

    def column_filter_to_condition(self, column_filter: ColumnFilter):
        if column_filter.operator == ColumnFilterOperators.EQUALS:
            return Field(column_filter.operand) == column_filter.value[0]
        elif column_filter.operator == ColumnFilterOperators.NOT_EQUALS:
            return Field(column_filter.operand) != column_filter.value[0]
        elif column_filter.operator == ColumnFilterOperators.GREATER_THAN:
            return Field(column_filter.operand) > column_filter.value[0]
        elif column_filter.operator == ColumnFilterOperators.GREATER_THAN_OR_EQUALS:
            return Field(column_filter.operand) >= column_filter.value[0]
        elif column_filter.operator == ColumnFilterOperators.LESS_THAN:
            return Field(column_filter.operand) < column_filter.value[0]
        elif column_filter.operator == ColumnFilterOperators.LESS_THAN_OR_EQUALS:
            return Field(column_filter.operand) <= column_filter.value[0]
        elif column_filter.operator == ColumnFilterOperators.IN:
            return Field(column_filter.operand).isin(column_filter.value)
        elif column_filter.operator == ColumnFilterOperators.NOT_IN:
            return Field(column_filter.operand).notin(column_filter.value)

    def build_transient_columns_query(
        self,
        datasource_id,
        dimensions: List[DimensionDefinition],
        metrics: List[MetricDefinition],
    ):
        query = ClickHouseQuery.from_(self.table).where(
            self.table.datasource_id == Parameter("%(ds_id)s")
        )

        query = query.select(*[d.property for d in dimensions])

        for metric in metrics:
            if metric.formula == Formula.COUNT:
                query = query.select(fn.Count("*"))
            if metric.formula == Formula.COUNTIF:
                conditions = [
                    self.column_filter_to_condition(column_filter=filter)
                    for filter in metric.filters
                ]
                query = query.select(
                    fn.Count(Case().when(Criterion.all(conditions), 1))
                )

        query = query.groupby(*range(1, len(dimensions) + 1))
        return query.get_sql(), {"ds_id": datasource_id}
