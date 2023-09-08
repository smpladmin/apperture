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
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
    ):
        self.clickhouse = clickhouse.client

    def create_api_table(self, databasename: str, tableName: str):
        query = f"CREATE TABLE IF NOT EXISTS {databasename}.{tableName} ( create_time DateTime, datasourceId String, properties JSON ) ENGINE = MergeTree() ORDER BY create_time;"
        self.clickhouse.command(query, {})
        return True
    
    def clear_api_table_records(self, databasename, tableName, start_time, end_time, columns):
        query = f"ALTER TABLE {databasename}.{tableName} DELETE where toDate(create_time) >= toDate('{start_time}') and toDate(create_time) <= toDate('{end_time}');"
        self.clickhouse.command(query, {})
        return True

    def insert_into_api_table(self, apidata, databasename, tableName, columns):
        self.clickhouse.insert(
            f"{databasename}.{tableName}", apidata, column_names=columns
        )
