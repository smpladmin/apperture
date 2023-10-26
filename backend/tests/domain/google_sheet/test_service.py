from collections import namedtuple
import datetime
from unittest.mock import ANY, AsyncMock, MagicMock
from beanie import PydanticObjectId

import pytest
from domain.google_sheet.models import SheetQuery, SheetReference
from domain.google_sheet.service import GoogleSheetService


class TestGoogleSheetService:
    def setup_method(self):
        self.google_sheet = MagicMock()

        SheetQuery.get_settings = MagicMock()
        SheetQuery.insert = AsyncMock()
        self.service = GoogleSheetService()
        self.ds_id = "636a1c61d715ca6baae65611"
        self.spreadsheet_id = "1wk7863jhstoPkL"
        SheetQuery.id = MagicMock(return_value=self.ds_id)
        SheetQuery.user_id = MagicMock(return_value=self.ds_id)
        SheetQuery.enabled = MagicMock(return_value=True)
        SheetQuery.app_id = MagicMock(return_value=self.ds_id)
        SheetQuery.spreadsheet_id = MagicMock(return_value=self.spreadsheet_id)
        FindMock = namedtuple("FindMock", ["to_list"])
        SheetQuery.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )

        self.google_sheet_query = SheetQuery(
            name="Sheet1 A1:F50",
            app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
            user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
            query="Select * from events LIMIT 500",
            spreadsheet_id="1wk7863jhstoPkL",
            chats=[],
            sheet_reference=SheetReference(
                sheet_name="Sheet1", row_index=1, column_index=1
            ),
            enabled=True,
        )

    def test_build_sheet_query(self):

        sheet_query = self.service.build_sheet_query(
            name="Sheet1 A1:F50",
            app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
            user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
            query="Select * from events LIMIT 500",
            spreadsheet_id="1wk7863jhstoPkL",
            chats=[],
            sheet_reference={"sheet_name": "Sheet1", "row_index": 1, "column_index": 1},
        )

        assert sheet_query.dict() == {
            "id": None,
            "revision_id": None,
            "created_at": ANY,
            "updated_at": None,
            "app_id": PydanticObjectId("63ca46feee94e38b81cda37a"),
            "user_id": PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
            "name": "Sheet1 A1:F50",
            "query": "Select * from events LIMIT 500",
            "spreadsheet_id": "1wk7863jhstoPkL",
            "chats": [],
            "sheet_reference": {
                "sheet_name": "Sheet1",
                "row_index": 1,
                "column_index": 1,
            },
            "enabled": True,
        }

    @pytest.mark.asyncio
    async def test_add_workbook(self):
        await self.service.add_sheet_query(sheet_query=self.google_sheet_query)
        assert SheetQuery.insert.called

    @pytest.mark.asyncio
    async def test_update_workbook(self):
        FindMock = namedtuple("FindMock", ["update"])
        SheetQuery.find_one = MagicMock(
            return_value=FindMock(
                update=AsyncMock(),
            ),
        )
        await self.service.update_sheet_query(
            sheet_query_id=self.ds_id, sheet_query=self.google_sheet_query
        )
        assert SheetQuery.find_one.called

    @pytest.mark.asyncio
    async def test_get_sheet_queries_by_spreadsheet_id(self):
        await self.service.get_sheet_queries_by_spreadsheet_id(
            spreadsheet_id=self.spreadsheet_id
        )
        SheetQuery.find.assert_called_once()
