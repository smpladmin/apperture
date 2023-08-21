import logging
from typing import List, Optional, Union

from fastapi import Depends
from pypika import Case, ClickHouseQuery, Criterion, Database, Field, Parameter, Table
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

    def build_transient_expression_query(
        self, expressions: List[str], variables: dict, database: str, table: str
    ):
        query = ClickHouseQuery.from_(Table(table, schema=database))
        for variable, column in variables.items():
            query = query.select(Field(column).as_(variable))
        for expression in expressions:
            query = query.select((Parameter(expression[1:])).as_(expression))
        query = query.limit(500)
        return query.get_sql()

    def compute_transient_expression(
        self,
        username: str,
        password: str,
        expressions: List[str],
        variables: dict,
        database: str,
        table: str,
    ):
        query = self.build_transient_expression_query(
            variables=variables, expressions=expressions, database=database, table=table
        )

        logging.info(f"compute_transient_expression query:  {query}")
        restricted_client = self.clickhouse.get_connection_for_user(
            username=username,
            password=password,
        )

        return restricted_client.query(query=query)

    def compute_transient_pivot(self, sql, rows, columns, values, username, password):
        sheet_query = f"({sql})"
        query = ClickHouseQuery.from_(Table("<inner_table>"))
        for properties in [*rows, *columns]:
            query = query.select(Field(properties))

        for value in values:
            query = query.select(fn.Sum(Field(value)))

        for row in rows:
            query = query.groupby(row).orderby(row)

        for col in columns:
            query = query.groupby(col).orderby(col)
        query = query.limit(500)
        query = query.get_sql().replace('"<inner_table>"', sheet_query)
        restricted_client = self.clickhouse.get_connection_for_user(
            username=username,
            password=password,
        )

        return restricted_client.query(query=query).result_set

    def compute_ordered_distinct_values(self, sql, values, username, password):
        sheet_query = f"({sql})"
        query = ClickHouseQuery.from_(Table("<inner_table>"))
        for value in values:
            query = query.select(Field(value))
            query = query.groupby(value).orderby(value)
        query = query.limit(500)
        query = query.get_sql().replace('"<inner_table>"', sheet_query)
        restricted_client = self.clickhouse.get_connection_for_user(
            username=username,
            password=password,
        )

        return restricted_client.query(query=query).result_set
