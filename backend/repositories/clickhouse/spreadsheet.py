import re

from fastapi import Depends, HTTPException
from pypika import ClickHouseQuery

from clickhouse.clickhouse import Clickhouse
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.parser.query_parser import QueryParser


class Spreadsheets(EventsBase):
    def __init__(
        self, clickhouse: Clickhouse = Depends(), parser: QueryParser = Depends()
    ):
        super().__init__(clickhouse=clickhouse)
        self.parser = parser

    def get_transient_spreadsheet(self, dsId: str, query: str, is_sql: bool):
        if is_sql:
            query = self.parser.validate_query_string(query_string=query, dsId=dsId)
        return self.execute_query_with_column_names(query, {})
