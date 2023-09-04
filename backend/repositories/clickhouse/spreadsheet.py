import logging
from typing import List, Union

from fastapi import Depends
from pypika import Case, ClickHouseQuery, Criterion, Field, Table, AliasedQuery
from pypika import functions as fn

from clickhouse.clickhouse import Clickhouse
from domain.apps.models import ClickHouseCredential
from domain.spreadsheets.models import (
    ColumnFilter,
    ColumnFilterOperators,
    DimensionDefinition,
    Formula,
    MetricDefinition,
)
from repositories.clickhouse.base import EventsBase


class Spreadsheets(EventsBase):
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
    ):
        super().__init__(clickhouse=clickhouse)
        self.clickhouse = clickhouse

    def get_transient_spreadsheet(
        self,
        query: str,
        username: Union[str, None],
        password: Union[str, None],
    ):
        restricted_client = self.clickhouse.get_connection_for_user(
            username=username, password=password
        )
        logging.info(query)
        result = restricted_client.query(query=query)
        restricted_client.close()
        return result

    def get_transient_columns(
        self,
        datasource_id: str,
        dimensions: List[DimensionDefinition],
        metric: Union[MetricDefinition, None],
        database: str,
        table: str,
        clickhouse_credentials: ClickHouseCredential,
    ):
        restricted_client = self.clickhouse.get_connection_for_user(
            username=clickhouse_credentials.username,
            password=clickhouse_credentials.password,
        )

        return restricted_client.query(
            *self.build_transient_columns_query(
                datasource_id, dimensions, metric, database, table
            )
        )

    def column_filter_to_condition(self, column_filter: ColumnFilter):
        operator_mapping = {
            ColumnFilterOperators.EQUALS: Field(column_filter.operand)
            == column_filter.value[0],
            ColumnFilterOperators.NOT_EQUALS: Field(column_filter.operand)
            != column_filter.value[0],
            ColumnFilterOperators.GREATER_THAN: Field(column_filter.operand)
            > column_filter.value[0],
            ColumnFilterOperators.GREATER_THAN_OR_EQUALS: Field(column_filter.operand)
            >= column_filter.value[0],
            ColumnFilterOperators.LESS_THAN: Field(column_filter.operand)
            < column_filter.value[0],
            ColumnFilterOperators.LESS_THAN_OR_EQUALS: Field(column_filter.operand)
            <= column_filter.value[0],
            ColumnFilterOperators.IN: Field(column_filter.operand).isin(
                column_filter.value
            ),
            ColumnFilterOperators.NOT_IN: Field(column_filter.operand).notin(
                column_filter.value
            ),
        }

        return operator_mapping.get(column_filter.operator, None)

    def build_transient_columns_query(
        self,
        datasource_id,
        dimensions: List[DimensionDefinition],
        metrics: List[MetricDefinition],
        database: str,
        table: str,
    ):
        query = ClickHouseQuery.from_(Table(table, schema=database))
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

        query = query.groupby(*range(1, len(dimensions) + 1)).limit(1000)
        return query.get_sql(), {"ds_id": datasource_id}

    def build_vlookup_query(
        self,
        search_query: str,
        lookup_query: str,
        search_column: str,
        lookup_column: str,
    ):
        query = f"with lookup_query as ({lookup_query}), map as (SELECT DISTINCT ON ({search_column}) {search_column}, {lookup_column} AS lookup_column FROM lookup_query ORDER BY {search_column}), cte as ({search_query}) select lookup_column from cte left join map on cte.{search_column} = map.{search_column}"

        return query

    def get_vlookup(
        self,
        search_query: str,
        lookup_query: str,
        search_column: str,
        lookup_column: str,
        username: Union[str, None],
        password: Union[str, None],
    ):
        query = self.build_vlookup_query(
            search_query=search_query,
            lookup_query=lookup_query,
            search_column=search_column,
            lookup_column=lookup_column,
        )
        result = self.execute_query_for_restricted_client(
            query=query, username=username, password=password
        )
        return [item for sublist in result.result_set for item in sublist]
