from fastapi import Depends

from repositories.clickhouse.spreadsheet import Spreadsheets


class SpreadsheetService:
    def __init__(
        self,
        spreadsheets: Spreadsheets = Depends(),
    ):
        self.segments = spreadsheets

    def get_transient_spreadsheets(self, dsId: str, query: str):
        result = self.segments.get_transient_spreadsheet(dsId=dsId, query=query)
        return {"result": result.result_set, "header": result.column_names}
