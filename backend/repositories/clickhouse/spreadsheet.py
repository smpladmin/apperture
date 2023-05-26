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

    def parse_query_string(self, query_string: str):
        table_name = re.search(r"FROM\s+(\w+)", query_string, re.IGNORECASE).group(1)
        ch_query = ClickHouseQuery.from_(table_name)

    def get_transient_spreadsheet(self, dsId: str, query: str):
        query = self.parser.validate_query_string(query_string=query, dsId=dsId)
        try:
            return self.execute_query_with_column_names(query, {})
        except:
            raise HTTPException(status_code=400, detail="Something went wrong")
