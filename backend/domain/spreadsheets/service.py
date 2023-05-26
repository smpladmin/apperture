import re

from fastapi import Depends

from domain.spreadsheets.models import ComputedSpreadsheet
from repositories.clickhouse.spreadsheet import Spreadsheets


class SpreadsheetService:
    def __init__(
        self,
        spreadsheets: Spreadsheets = Depends(),
    ):
        self.spreadsheets = spreadsheets

    def cleanse_query_string(self, query_string: str) -> str:
        return re.sub(r"\s+|\n+", " ", query_string).strip()

    def get_transient_spreadsheets(self, dsId: str, query: str) -> ComputedSpreadsheet:
        query = self.cleanse_query_string(query)
        result = self.spreadsheets.get_transient_spreadsheet(dsId=dsId, query=query)
        response = {"headers": result.column_names, "data": []}

        for idx, row in enumerate(result.result_set):
            row_data = {"index": idx + 1}
            for col_idx, column_name in enumerate(result.column_names):
                row_data[column_name] = row[col_idx]
            response["data"].append(row_data)

        return ComputedSpreadsheet(data=response["data"], headers=response["headers"])
