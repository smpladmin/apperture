from beanie import PydanticObjectId
from fastapi import Depends
from pypika import analytics as an
from pypika import functions as fn

from clickhouse.clickhouse import Clickhouse
from repositories.clickhouse.base import EventsBase


class Spreadsheets(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        super().__init__(clickhouse=clickhouse)

    def get_transient_spreadsheet(self, dsId: str, query: str):
        return self.execute_query_with_column_names(query, {})
