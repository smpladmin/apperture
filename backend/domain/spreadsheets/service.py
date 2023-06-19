import re
from datetime import datetime
from typing import List

from beanie import PydanticObjectId
from fastapi import Depends

from domain import spreadsheets
from domain.spreadsheets.models import (
    ColumnDefinition,
    ColumnType,
    ComputedSpreadsheet,
    Spreadsheet,
    SpreadSheetColumn,
    WorkBook,
)
from repositories.clickhouse.spreadsheet import Spreadsheets


class SpreadsheetService:
    def __init__(
        self,
        spreadsheets: Spreadsheets = Depends(),
    ):
        self.spreadsheets = spreadsheets

    async def add_workbook(self, workbook: WorkBook):
        workbook.updated_at = workbook.created_at
        await WorkBook.insert(workbook)

    def build_workbook(
        self,
        name: str,
        datasource_id: PydanticObjectId,
        spreadsheets: List[Spreadsheet],
        app_id: PydanticObjectId,
        user_id: PydanticObjectId,
    ):
        return WorkBook(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            spreadsheets=spreadsheets,
        )

    async def get_workbooks_for_datasource_id(
        self, datasource_id: str
    ) -> List[WorkBook]:
        return await WorkBook.find(
            WorkBook.datasource_id == PydanticObjectId(datasource_id),
            WorkBook.enabled == True,
        ).to_list()

    async def get_workbooks_by_user_id(
        self, user_id: PydanticObjectId
    ) -> List[WorkBook]:
        return await WorkBook.find(
            WorkBook.user_id == user_id,
            WorkBook.enabled == True,
        ).to_list()

    def cleanse_query_string(self, query_string: str) -> str:
        query_string = re.sub(r"--.*\n+", " ", query_string)
        return re.sub(r"\s+|\n+", " ", query_string).strip()

    async def get_transient_spreadsheets(
        self, query: str, username: str, password: str
    ) -> ComputedSpreadsheet:
        query = self.cleanse_query_string(query)
        result = self.spreadsheets.get_transient_spreadsheet(
            query=query,
            username=username,
            password=password,
        )
        response = {
            "headers": [
                SpreadSheetColumn(name=name, type=ColumnType.QUERY_HEADER)
                for name in result.column_names
            ],
            "data": [],
        }

        for idx, row in enumerate(result.result_set):
            row_data = {"index": idx + 1}
            for col_idx, column_name in enumerate(result.column_names):
                row_data[column_name] = row[col_idx]
            response["data"].append(row_data)

        return ComputedSpreadsheet(data=response["data"], headers=response["headers"])

    async def get_workbook_by_id(self, workbook_id: str):
        return await WorkBook.find_one(WorkBook.id == PydanticObjectId(workbook_id))

    async def update_workbook(self, workbook_id: str, workbook: WorkBook):
        entry = workbook.dict()
        entry.pop("id")
        entry.pop("created_at")
        entry["updated_at"] = datetime.utcnow()

        await WorkBook.find_one(
            WorkBook.id == PydanticObjectId(workbook_id),
        ).update({"$set": entry})

    def get_transient_column(self, datasource_id: str, columns: List[ColumnDefinition]):
        return self.spreadsheets.get_transient_columns(datasource_id, columns)
