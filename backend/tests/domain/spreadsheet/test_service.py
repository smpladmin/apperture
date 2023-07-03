from collections import namedtuple
from unittest.mock import ANY, AsyncMock, MagicMock

import pytest
from beanie import PydanticObjectId

from domain.spreadsheets.models import (
    ColumnType,
    ComputedSpreadsheet,
    Spreadsheet,
    SpreadSheetColumn,
    WorkBook,
)
from domain.spreadsheets.service import SpreadsheetService


class TestSpreadsheetService:
    def setup_method(self):
        self.spreadsheet = MagicMock()
        WorkBook.get_settings = MagicMock()
        WorkBook.insert = AsyncMock()
        self.ds_id = "636a1c61d715ca6baae65611"
        self.service = SpreadsheetService(spreadsheets=self.spreadsheet)
        self.query = """
        SELECT  event_name -- selecting event
        FROM  events
        WHERE timestamp>=toDate(2023-02-11)"""
        self.spreadsheet.get_transient_spreadsheet = MagicMock()
        self.column_names = ["event_name"]
        self.result_set = [
            tuple(["test_event_1"]),
            tuple(["test_event_2"]),
            tuple(["test_event_3"]),
            tuple(["test_event_4"]),
            tuple(["test_event_5"]),
        ]
        QueryResult = namedtuple("query_result", ["result_set", "column_names"])
        self.spreadsheet.get_transient_spreadsheet = MagicMock(
            return_value=QueryResult(
                result_set=self.result_set,
                column_names=self.column_names,
            )
        )

        self.result_data = [
            {"index": 1, "event_name": "test_event_1"},
            {"index": 2, "event_name": "test_event_2"},
            {"index": 3, "event_name": "test_event_3"},
            {"index": 4, "event_name": "test_event_4"},
            {"index": 5, "event_name": "test_event_5"},
        ]
        self.workbook = WorkBook(
            id=PydanticObjectId("63d0df1ea1040a6388a4a34c"),
            datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
            app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
            user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
            name="Test Workbook",
            spreadsheets=[
                Spreadsheet(
                    name="Sheet1",
                    headers=[
                        SpreadSheetColumn(
                            name="event_name", type=ColumnType.QUERY_HEADER
                        )
                    ],
                    is_sql=True,
                    query="SELECT  event_name FROM  events",
                )
            ],
            enabled=True,
        )
        WorkBook.id = MagicMock(return_value=self.ds_id)
        WorkBook.datasource_id = MagicMock(return_value=self.ds_id)
        WorkBook.user_id = MagicMock(return_value=self.ds_id)
        WorkBook.enabled = MagicMock(return_value=True)
        WorkBook.app_id = MagicMock(return_value=self.ds_id)
        FindMock = namedtuple("FindMock", ["to_list"])
        WorkBook.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        WorkBook.find_one = AsyncMock()

    def test_cleanse_query_string(self):
        result = self.service.cleanse_query_string(self.query)
        assert (
            result
            == "SELECT event_name FROM events WHERE timestamp>=toDate(2023-02-11)"
        )

    @pytest.mark.asyncio
    async def test_get_transient_spreadsheets(self):
        result = await self.service.get_transient_spreadsheets(
            query=self.query, username="", password=""
        )
        assert result == ComputedSpreadsheet(
            headers=[
                SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER)
            ],
            data=self.result_data,
        )

    def test_build_workbook(self):
        workbook = self.service.build_workbook(
            name="Test Workbook",
            spreadsheets=[
                Spreadsheet(
                    name="Sheet1",
                    headers=[
                        SpreadSheetColumn(
                            name="event_name", type=ColumnType.QUERY_HEADER
                        )
                    ],
                    is_sql=True,
                    query="SELECT  event_name FROM  events",
                )
            ],
            datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
            app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
            user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
        )

        assert workbook.dict() == {
            "id": None,
            "revision_id": None,
            "created_at": ANY,
            "updated_at": None,
            "datasource_id": PydanticObjectId("63d0a7bfc636cee15d81f579"),
            "app_id": PydanticObjectId("63ca46feee94e38b81cda37a"),
            "user_id": PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
            "name": "Test Workbook",
            "spreadsheets": [
                {
                    "name": "Sheet1",
                    "headers": [
                        {"name": "event_name", "type": ColumnType.QUERY_HEADER}
                    ],
                    "is_sql": True,
                    "query": "SELECT  event_name FROM  events",
                    "subHeaders": None,
                }
            ],
            "enabled": True,
        }

    @pytest.mark.asyncio
    async def test_get_workbooks_for_datasource_id(self):
        await self.service.get_workbooks_for_datasource_id(datasource_id=self.ds_id)
        WorkBook.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_workbooks_for_user_id(self):
        await self.service.get_workbooks_for_user_id(user_id=self.ds_id)
        WorkBook.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_workbooks_for_app(self):
        await self.service.get_workbooks_for_app(app_id=self.ds_id)
        WorkBook.find.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_workbook_by_id(self):
        await self.service.get_workbook_by_id(workbook_id=self.ds_id)
        WorkBook.find_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_add_workbook(self):
        await self.service.add_workbook(workbook=self.workbook)
        assert WorkBook.insert.called

    @pytest.mark.asyncio
    async def test_update_workbook(self):
        FindMock = namedtuple("FindMock", ["update"])
        WorkBook.find_one = MagicMock(
            return_value=FindMock(
                update=AsyncMock(),
            ),
        )
        await self.service.update_workbook(
            workbook_id=self.ds_id, workbook=self.workbook
        )
        assert WorkBook.find_one.called
