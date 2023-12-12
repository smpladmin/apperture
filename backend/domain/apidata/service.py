from typing import Union
from fastapi import Depends
from clickhouse.clickhouse import Clickhouse
from domain.datasources.models import DataSource
from domain.edge.models import Node
from repositories.clickhouse.apidata import APIData
from domain.events.models import (
    PaginatedEventsData,
    Event,
    AuxTable1Event,
    AuxTable2Event,
)

from repositories.clickhouse.base import EventsBase
import json


class APIDataService:
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
        apidata_repo: APIData = Depends(),
    ):
        self.clickhouse = clickhouse.client
        self.columns = [
            "create_time",
            "datasourceId",
            "properties",
        ]
        self.apidata_repo = apidata_repo

    async def update_api_data(
        self, apidata, databasename, tableName, start_time, end_time
    ):
        self.apidata_repo.create_api_table(databasename, tableName)
        self.apidata_repo.clear_api_table_records(
            databasename, tableName, start_time, end_time, self.columns
        )
        self.apidata_repo.insert_into_api_table(
            apidata, databasename, tableName, self.columns
        )
