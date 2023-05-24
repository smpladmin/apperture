from fastapi import Depends
from domain.spreadsheets.models import ComputedSpreadsheet

from repositories.clickhouse.spreadsheet import Spreadsheets
from rest.dtos.spreadsheets import ComputedSpreadsheetQueryResponse


class SpreadsheetService:
    def __init__(
        self,
        spreadsheets: Spreadsheets = Depends(),
    ):
        self.spreadsheets = spreadsheets

    def get_transient_spreadsheets(self, dsId: str, query: str) -> ComputedSpreadsheet:
        result = self.spreadsheets.get_transient_spreadsheet(dsId=dsId, query=query)
        response = {"headers": result.column_names, "data": []}
        for row in result.result_set:
            row_data = {}
            for index in range(len(result.column_names)):
                row_data[result.column_names[index]] = row[index]
            response["data"].append(row_data)

        return ComputedSpreadsheet(data=response["data"], headers=response["headers"])
