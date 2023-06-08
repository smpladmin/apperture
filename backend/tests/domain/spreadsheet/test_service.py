from collections import namedtuple
from unittest.mock import MagicMock

import pytest

from domain.spreadsheets.models import ComputedSpreadsheet
from domain.spreadsheets.service import SpreadsheetService


class TestSpreadsheetService:
    def setup_method(self):
        self.spreadsheet = MagicMock()
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
            headers=["event_name"], data=self.result_data
        )
