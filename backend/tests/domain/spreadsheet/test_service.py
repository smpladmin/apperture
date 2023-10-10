from collections import namedtuple
from unittest.mock import ANY, AsyncMock, MagicMock

import pytest
from beanie import PydanticObjectId

from domain.apps.models import ClickHouseCredential
from domain.spreadsheets.models import (
    AggregateFunction,
    AIQuery,
    ColumnType,
    ComputedSpreadsheet,
    PivotAxisDetail,
    PivotValueDetail,
    SortingOrder,
    Spreadsheet,
    SpreadSheetColumn,
    SpreadsheetType,
    WorkBook,
)
from domain.spreadsheets.service import SpreadsheetService
from repositories.clickhouse.parser.query_parser import QueryParser


class TestSpreadsheetService:
    def setup_method(self):
        self.spreadsheet = MagicMock()
        WorkBook.get_settings = MagicMock()
        WorkBook.insert = AsyncMock()
        self.ds_id = "636a1c61d715ca6baae65611"
        self.service = SpreadsheetService(
            spreadsheets=self.spreadsheet, parser=QueryParser()
        )
        self.query = """
        SELECT  event_name -- selecting event
        FROM  events
        WHERE timestamp>=toDate(2023-02-11)"""
        self.cleaned_query = "SELECT  event_name          FROM  events         WHERE timestamp>=toDate(2023-02-11)"
        self.cleaned_query_with_limit = """SELECT  event_name          FROM  events         WHERE timestamp>=toDate(2023-02-11) ORDER BY 1 LIMIT 500"""
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
        self.spreadsheet.execute_query_for_restricted_client = MagicMock(
            return_value=QueryResult(
                result_set=self.result_set,
                column_names=self.column_names,
            )
        )

        self.result_data = [
            {"event_name": "test_event_1"},
            {"event_name": "test_event_2"},
            {"event_name": "test_event_3"},
            {"event_name": "test_event_4"},
            {"event_name": "test_event_5"},
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
        self.pivot_axis_row_with_total = PivotAxisDetail(
            name="user_id",
            sort_by="user_id",
            order_by=SortingOrder.ASC,
            show_total=True,
        )
        self.pivot_axis_row_without_total = PivotAxisDetail(
            name="user_id",
            sort_by="user_id",
            order_by=SortingOrder.ASC,
            show_total=False,
        )
        self.pivot_axis_column_without_total = PivotAxisDetail(
            name="weekday",
            sort_by="weekday",
            order_by=SortingOrder.ASC,
            show_total=False,
        )
        self.pivot_axis_value = PivotValueDetail(
            name="salary", function=AggregateFunction.SUM
        )

        self.populated_pivot_data = {
            21: {
                "Friday": 666.19,
                "Monday": 1692.88,
                "Saturday": 423.24,
                "Sunday": 859.38,
                "Thursday": 2457.4399999999996,
                "Tuesday": 423.24,
                "Wednesday": 1523.03,
            },
            37: {
                "Friday": 0.0,
                "Monday": 423.24,
                "Saturday": 1612.68,
                "Sunday": 423.24,
                "Thursday": 1171.18,
                "Tuesday": 1535.52,
                "Wednesday": 2464.91,
            },
            137: {"Friday": 1649.65, "Saturday": 1118.73, "Sunday": 0.0},
            152: {"Tuesday": 1370.94, "Wednesday": 1314.24},
            191: {"Friday": 498.34, "Monday": 1264.84, "Thursday": 1301.94},
            198: {
                "Friday": 644.2,
                "Monday": 4378.0,
                "Saturday": 2710.6000000000004,
                "Sunday": 2923.2,
                "Thursday": 1368.82,
                "Tuesday": 2949.1800000000003,
                "Wednesday": 867.98,
            },
            234: {
                "Friday": 1229.93,
                "Monday": 466.18,
                "Saturday": 509.24,
                "Sunday": 0.0,
                "Thursday": 320.94,
                "Tuesday": 470.54,
                "Wednesday": 496.34,
            },
            263: {
                "Friday": 406.48,
                "Monday": 299.44,
                "Saturday": 259.69,
                "Sunday": 413.39,
                "Thursday": 157.54,
                "Tuesday": 253.24,
                "Wednesday": 1223.02,
            },
            287: {
                "Friday": 3284.49,
                "Monday": 1866.7199999999998,
                "Saturday": 2092.57,
                "Sunday": 423.24,
                "Thursday": 3535.6800000000003,
                "Tuesday": 846.48,
                "Wednesday": 349.99,
            },
            295: {
                "Friday": 2631.25,
                "Monday": 633.24,
                "Saturday": 4216.0199999999995,
                "Sunday": 2092.96,
                "Wednesday": 976.48,
            },
            488: {
                "Friday": 2036.48,
                "Monday": 3410.25,
                "Saturday": 4793.63,
                "Sunday": 610.74,
                "Thursday": 1484.84,
                "Tuesday": 3198.26,
                "Wednesday": 1754.68,
            },
        }

        self.pivot_result_set = [
            (21, "Friday", 666.19),
            (21, "Monday", 1692.88),
            (21, "Saturday", 423.24),
            (21, "Sunday", 859.38),
            (21, "Thursday", 2457.4399999999996),
            (21, "Tuesday", 423.24),
            (21, "Wednesday", 1523.03),
            (37, "Friday", 0.0),
            (37, "Monday", 423.24),
            (37, "Saturday", 1612.68),
            (37, "Sunday", 423.24),
            (37, "Thursday", 1171.18),
            (37, "Tuesday", 1535.52),
            (37, "Wednesday", 2464.91),
            (137, "Friday", 1649.65),
            (137, "Saturday", 1118.73),
            (137, "Sunday", 0.0),
            (152, "Tuesday", 1370.94),
            (152, "Wednesday", 1314.24),
            (191, "Friday", 498.34),
            (191, "Monday", 1264.84),
            (191, "Thursday", 1301.94),
            (198, "Friday", 644.2),
            (198, "Monday", 4378.0),
            (198, "Saturday", 2710.6000000000004),
            (198, "Sunday", 2923.2),
            (198, "Thursday", 1368.82),
            (198, "Tuesday", 2949.1800000000003),
            (198, "Wednesday", 867.98),
            (234, "Friday", 1229.93),
            (234, "Monday", 466.18),
            (234, "Saturday", 509.24),
            (234, "Sunday", 0.0),
            (234, "Thursday", 320.94),
            (234, "Tuesday", 470.54),
            (234, "Wednesday", 496.34),
            (263, "Friday", 406.48),
            (263, "Monday", 299.44),
            (263, "Saturday", 259.69),
            (263, "Sunday", 413.39),
            (263, "Thursday", 157.54),
            (263, "Tuesday", 253.24),
            (263, "Wednesday", 1223.02),
            (287, "Friday", 3284.49),
            (287, "Monday", 1866.7199999999998),
            (287, "Saturday", 2092.57),
            (287, "Sunday", 423.24),
            (287, "Thursday", 3535.6800000000003),
            (287, "Tuesday", 846.48),
            (287, "Wednesday", 349.99),
            (295, "Friday", 2631.25),
            (295, "Monday", 633.24),
            (295, "Saturday", 4216.0199999999995),
            (295, "Sunday", 2092.96),
            (295, "Wednesday", 976.48),
            (488, "Friday", 2036.48),
            (488, "Monday", 3410.25),
            (488, "Saturday", 4793.63),
            (488, "Sunday", 610.74),
            (488, "Thursday", 1484.84),
            (488, "Tuesday", 3198.26),
            (488, "Wednesday", 1754.68),
        ]

    def test_cleanse_query_string(self):
        result = self.service.cleanse_query_string(self.query)
        assert (
            result
            == "SELECT  event_name          FROM  events         WHERE timestamp>=toDate(2023-02-11)"
        )

    @pytest.mark.asyncio
    async def test_get_transient_spreadsheets(self):
        result = await self.service.get_transient_spreadsheets(
            query=self.query,
            credential=ClickHouseCredential(username="", password="", databasename=""),
        )
        assert result == ComputedSpreadsheet(
            headers=self.column_names,
            data=self.result_set,
            sql=self.cleaned_query_with_limit,
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
                    is_sql=False,
                    query="",
                    edit_mode=True,
                    meta={"dsId": "", "selectedColumns": []},
                    sheet_type=SpreadsheetType.SIMPLE_SHEET,
                    ai_query=AIQuery(
                        nl_query="get me users",
                        sql="",
                        word_replacements=[],
                        table="events",
                        database="default",
                    ),
                    column_format=None,
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
                    "is_sql": False,
                    "query": "",
                    "subHeaders": None,
                    "edit_mode": True,
                    "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                    "meta": {"dsId": "", "selectedColumns": []},
                    "ai_query": {
                        "nl_query": "get me users",
                        "sql": "",
                        "word_replacements": [],
                        "table": "events",
                        "database": "default",
                    },
                    "column_format": None,
                    "charts": [],
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

    def test_populate_data(self):
        result = self.service.populate_data(data={}, result_set=self.pivot_result_set)
        assert result == self.populated_pivot_data

    def test_populate_row_totals(self):
        result = self.service.populate_row_totals(
            data=self.populated_pivot_data,
            key="Total",
            unique_rows=[
                (21, 8045.399999999999),
                (37, 7630.77),
                (137, 2768.38),
                (152, 2685.1800000000003),
                (191, 3065.12),
                (198, 15841.979999999998),
                (234, 3493.17),
                (263, 3012.8),
            ],
        )
        assert result == {
            21: {
                "Friday": 666.19,
                "Monday": 1692.88,
                "Saturday": 423.24,
                "Sunday": 859.38,
                "Thursday": 2457.4399999999996,
                "Tuesday": 423.24,
                "Wednesday": 1523.03,
                "Total": 8045.399999999999,
            },
            37: {
                "Friday": 0.0,
                "Monday": 423.24,
                "Saturday": 1612.68,
                "Sunday": 423.24,
                "Thursday": 1171.18,
                "Tuesday": 1535.52,
                "Wednesday": 2464.91,
                "Total": 7630.77,
            },
            137: {
                "Friday": 1649.65,
                "Saturday": 1118.73,
                "Sunday": 0.0,
                "Total": 2768.38,
            },
            152: {
                "Tuesday": 1370.94,
                "Wednesday": 1314.24,
                "Total": 2685.1800000000003,
            },
            191: {
                "Friday": 498.34,
                "Monday": 1264.84,
                "Thursday": 1301.94,
                "Total": 3065.12,
            },
            198: {
                "Friday": 644.2,
                "Monday": 4378.0,
                "Saturday": 2710.6000000000004,
                "Sunday": 2923.2,
                "Thursday": 1368.82,
                "Tuesday": 2949.1800000000003,
                "Wednesday": 867.98,
                "Total": 15841.979999999998,
            },
            234: {
                "Friday": 1229.93,
                "Monday": 466.18,
                "Saturday": 509.24,
                "Sunday": 0.0,
                "Thursday": 320.94,
                "Tuesday": 470.54,
                "Wednesday": 496.34,
                "Total": 3493.17,
            },
            263: {
                "Friday": 406.48,
                "Monday": 299.44,
                "Saturday": 259.69,
                "Sunday": 413.39,
                "Thursday": 157.54,
                "Tuesday": 253.24,
                "Wednesday": 1223.02,
                "Total": 3012.8,
            },
            287: {
                "Friday": 3284.49,
                "Monday": 1866.7199999999998,
                "Saturday": 2092.57,
                "Sunday": 423.24,
                "Thursday": 3535.6800000000003,
                "Tuesday": 846.48,
                "Wednesday": 349.99,
            },
            295: {
                "Friday": 2631.25,
                "Monday": 633.24,
                "Saturday": 4216.0199999999995,
                "Sunday": 2092.96,
                "Wednesday": 976.48,
            },
            488: {
                "Friday": 2036.48,
                "Monday": 3410.25,
                "Saturday": 4793.63,
                "Sunday": 610.74,
                "Thursday": 1484.84,
                "Tuesday": 3198.26,
                "Wednesday": 1754.68,
            },
        }

    @pytest.mark.asyncio
    async def test_compute_vlookup(self):
        self.spreadsheet.get_vlookup.return_value = ["test1", "test2"]
        assert await self.service.compute_vlookup(
            credential=ClickHouseCredential(
                username="test_username",
                password="test_password",
                databasename="test_database",
            ),
            search_query="test search query",
            lookup_query="test lookup query",
            lookup_column="lookup_column",
            lookup_index_column="lookup_index_column",
            search_column="search_column",
        ) == ["test1", "test2"]

        self.spreadsheet.get_vlookup.assert_called_once_with(
            username="test_username",
            password="test_password",
            search_query="test search query ORDER BY  LIMIT 500",
            lookup_query="test lookup query",
            lookup_column="lookup_column",
            lookup_index_column="lookup_index_column",
            search_column="search_column",
        )
