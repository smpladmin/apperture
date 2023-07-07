from typing import List, Union
from pypika import (
    ClickHouseQuery,
    Parameter,
    functions as fn,
    Criterion,
    Field,
)
from clickhouse.clickhouse import Clickhouse
from repositories.clickhouse.base import EventsBase
from fastapi import Depends

class APIData(EventsBase):
    def __init__(self,clickhouse: Clickhouse = Depends(),):
        self.clickhouse = clickhouse.client

    def create_api_table(self, databasename: str, tableName: str):
        return True

    def insert_into_api_table(self, apidata, databasename, tableName,columns):
        self.clickhouse.insert(f"{databasename}.{tableName}",apidata,column_names=columns)
        return True
