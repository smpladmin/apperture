from fastapi import Depends

from repositories.clickhouse.spreadsheet import Spreadsheets


class SpreadsheetService:
    def __init__(
        self,
        spreadsheets: Spreadsheets = Depends(),
    ):
        self.spreadsheets = spreadsheets

    def get_transient_spreadsheets(self, dsId: str, query: str):
        result = self.spreadsheets.get_transient_spreadsheet(dsId=dsId, query=query)
        response = {"header": result.column_names, "data": []}
        for row in result.result_set:
            row_data = {}
            for index in range(len(result.column_names)):
                row_data[result.column_names[index]] = row[index]
            response["data"].append(row_data)

        return response
