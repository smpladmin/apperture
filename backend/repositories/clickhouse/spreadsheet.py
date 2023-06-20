import logging
from typing import List, Union

from fastapi import Depends

from clickhouse.clickhouse import Clickhouse
from domain.spreadsheets.models import ColumnDefinition, ColumnDefinitionType, Formula
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.parser.query_parser import QueryParser

from pypika import ClickHouseQuery, Parameter, functions as fn


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
        self, datasource_id: str, columns: List[ColumnDefinition]
    ):
        self.execute_get_query(
            *self.build_transient_columns_query(datasource_id, columns)
        )

    def build_transient_columns_query(self, datasource_id, columns):
        query = ClickHouseQuery.from_(self.table).where(
            self.table.datasource_id == Parameter("%(ds_id)s")
        )
        dimensions = [
            column
            for column in columns
            if column.type == ColumnDefinitionType.DIMENSION
        ]
        metrics = [
            column for column in columns if column.type == ColumnDefinitionType.METRIC
        ]

        query = query.select(*[d.property for d in dimensions])
        query = query.select(*[fn.Count("*") for m in metrics])

        query = query.groupby(*range(1, len(dimensions) + 1))
        return query.get_sql(), {"ds_id": datasource_id}
