import logging
import re

from fastapi import Depends

from domain.datasources.service import DataSourceService
from domain.spreadsheets.models import ComputedSpreadsheet
from repositories.clickhouse.spreadsheet import Spreadsheets


class SpreadsheetService:
    def __init__(
        self,
        spreadsheets: Spreadsheets = Depends(),
        datasource_service: DataSourceService = Depends(),
    ):
        self.spreadsheets = spreadsheets
        self.datasource_service = datasource_service

    def cleanse_query_string(self, query_string: str) -> str:
        query_string = re.sub(r"--.*\n+", " ", query_string)
        return re.sub(r"\s+|\n+", " ", query_string).strip()

    async def get_transient_spreadsheets(
        self, dsId: str, query: str, is_sql: bool
    ) -> ComputedSpreadsheet:
        query = self.cleanse_query_string(query)
        datasource = await self.datasource_service.get_datasource(dsId)
        logging.info(datasource.role_credential)
        result = self.spreadsheets.get_transient_spreadsheet(
            query=query,
            username=datasource.role_credential.username,
            password=datasource.role_credential.password,
        )
        response = {"headers": result.column_names, "data": []}

        for idx, row in enumerate(result.result_set):
            row_data = {"index": idx + 1}
            for col_idx, column_name in enumerate(result.column_names):
                row_data[column_name] = row[col_idx]
            response["data"].append(row_data)

        return ComputedSpreadsheet(data=response["data"], headers=response["headers"])
