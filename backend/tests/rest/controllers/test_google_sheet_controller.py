import json
from unittest.mock import ANY

import pytest
from beanie import PydanticObjectId

from ai.text_to_sql import text_to_sql
from domain.apperture_users.models import AppertureUser
from domain.apps.models import ClickHouseCredential
from domain.spreadsheets.models import ColumnType, DatabaseClient, SpreadSheetColumn


def test_compute_transient_result(
    client_init, spreadsheets_service, transient_spreadsheet_data_with_serialize_result
):
    response = client_init.post(
        "/apperture/google-sheets/transient",
        data=json.dumps(transient_spreadsheet_data_with_serialize_result),
    )
    assert response.status_code == 200
    assert response.json() == {
        "data": [
            ["test_event_1"],
            ["test_event_2"],
            ["test_event_3"],
            ["test_event_4"],
            ["test_event_5"],
        ],
        "headers": ["event_name"],
        "sql": "select * from events",
    }
    spreadsheets_service.get_transient_spreadsheets.assert_called_once_with(
        **{
            "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)",
            "credential": ClickHouseCredential(
                username="test_username",
                password="test_password",
                databasename="test_database",
            ),
            "client": DatabaseClient.CLICKHOUSE,
            "query_id": None,
            "app_id": "635ba034807ab86d8a2aadd9",
        }
    )


# def test_compute_transient_google_sheet_with_nlp(client_init, spreadsheets_service):
#     nlp_query_data = {
#         "query": "get count of event_name ",
#         "isSql": False,
#         "tableData": {
#             "tableName": "events",
#             "wordReplacements": [{"word": "event_name", "replacement": "event_name"}],
#         },
#     }
#     response = client_init.post(
#         "/apperture/google-sheets/transient",
#         data=json.dumps(nlp_query_data),
#     )
#     assert response.status_code == 200
#     assert response.json() == {
#         "headers": [SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER)],
#         "data": [
#             {"event_name": "test_event_1"},
#             {"event_name": "test_event_2"},
#             {"event_name": "test_event_3"},
#             {"event_name": "test_event_4"},
#             {"event_name": "test_event_5"},
#         ],
#         "sql": "select * from events",
#     }
#     spreadsheets_service.get_transient_spreadsheets.assert_called_with(
#         **{
#             "query": ANY,
#             "credential": ClickHouseCredential(
#                 username="test_username",
#                 password="test_password",
#                 databasename="test_database",
#             ),
#             "client": DatabaseClient.CLICKHOUSE,
#             "serializeResult": True,
#             "query_id": None,
#         }
#     )


def test_get_connections(
    client_init,
    apperture_user_service,
    app_service,
):
    user = AppertureUser(
        first_name="mock",
        last_name="mock",
        email="test@email.com",
        picture="",
        api_key="mock-api-key",
    )
    user.id = "1234"
    apperture_user_service.get_user_by_api_key.return_value = user

    response = client_init.get(
        "/apperture/google-sheets/connections", headers={"api-key": "mock-api-key"}
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "server": "ClickHouse",
            "connection_data": [
                {
                    "provider": "datamart",
                    "connection_source": [
                        {
                            "name": "name",
                            "fields": [],
                            "datasource_id": "635ba034807ab86d8a2aadd9",
                            "table_name": "dUKQaHtqxM",
                            "database_name": "test_database",
                        }
                    ],
                }
            ],
        }
    ]

    apperture_user_service.get_user_by_api_key.assert_called_with(
        **{"api_key": "mock-api-key"}
    )
    app_service.get_app_for_user.assert_called_with(**{"user_id": "1234"})


def test_get_saved_workbooks(client_init):
    response = client_init.get(
        "/apperture/google-sheets/workbooks", headers={"api-key": "mock-api-key"}
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": "63d0df1ea1040a6388a4a34c",
            "revisionId": None,
            "createdAt": ANY,
            "updatedAt": None,
            "datasourceId": "63d0a7bfc636cee15d81f579",
            "appId": "63ca46feee94e38b81cda37a",
            "userId": "6374b74e9b36ecf7e0b4f9e4",
            "name": "Test Workbook",
            "spreadsheets": [
                {
                    "name": "Sheet1",
                    "headers": [{"name": "event_name", "type": "QUERY_HEADER"}],
                    "subHeaders": None,
                    "is_sql": True,
                    "query": "SELECT  event_name FROM  events",
                    "edit_mode": True,
                    "sheet_type": "SIMPLE_SHEET",
                    "meta": {"dsId": "", "selectedColumns": []},
                    "ai_query": None,
                    "column_format": None,
                    "charts": [],
                }
            ],
            "enabled": True,
        }
    ]


def test_get_sheet_query(client_init, google_sheet_service):
    response = client_init.get(
        "/apperture/google-sheets/sheet-query/1wk7863jhstoPkL",
        headers={"api-key": "mock-api-key"},
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": None,
            "revisionId": None,
            "createdAt": ANY,
            "updatedAt": None,
            "appId": "63ca46feee94e38b81cda37a",
            "userId": "6374b74e9b36ecf7e0b4f9e4",
            "name": "Sheet1 A1:F50",
            "query": "Select * from events LIMIT 500",
            "spreadsheetId": "1wk7863jhstoPkL",
            "chats": [],
            "sheetReference": {
                "sheet_name": "Sheet1",
                "row_index": 1,
                "column_index": 1,
            },
            "enabled": True,
        }
    ]

    google_sheet_service.get_sheet_queries_by_spreadsheet_id.assert_called_with(
        **{"spreadsheet_id": "1wk7863jhstoPkL"}
    )


@pytest.mark.asyncio
async def test_save_sheet_query(client_init, google_sheet_service, sheet_query_data):
    response = client_init.post(
        "/apperture/google-sheets/sheet-query",
        headers={"api-key": "mock-api-key"},
        data=json.dumps(sheet_query_data),
    )

    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "revisionId": None,
        "createdAt": ANY,
        "updatedAt": None,
        "appId": "63ca46feee94e38b81cda37a",
        "userId": "6374b74e9b36ecf7e0b4f9e4",
        "name": "Sheet1 A1:F50",
        "query": "Select * from events LIMIT 500",
        "spreadsheetId": "1wk7863jhstoPkL",
        "chats": [],
        "sheetReference": {"sheet_name": "Sheet1", "row_index": 1, "column_index": 1},
        "enabled": True,
    }

    google_sheet_service.build_sheet_query.assert_called_with(
        **{
            "name": "test2",
            "app_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
            "user_id": "1234",
            "spreadsheet_id": "1wk7863jhstoPkL",
            "query": "Select * from events LIMIT 500",
            "chats": [],
            "sheet_reference": {
                "sheet_name": "Sheet1",
                "row_index": 1,
                "column_index": 1,
            },
        }
    )

    google_sheet_service.add_sheet_query.assert_called()


@pytest.mark.asyncio
async def test_update_sheet_query(client_init, google_sheet_service, sheet_query_data):
    response = client_init.put(
        "/apperture/google-sheets/sheet-query/1wk7863jhstoPkL",
        headers={"api-key": "mock-api-key"},
        data=json.dumps(sheet_query_data),
    )

    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "revisionId": None,
        "createdAt": ANY,
        "updatedAt": None,
        "appId": "63ca46feee94e38b81cda37a",
        "userId": "6374b74e9b36ecf7e0b4f9e4",
        "name": "Sheet1 A1:F50",
        "query": "Select * from events LIMIT 500",
        "spreadsheetId": "1wk7863jhstoPkL",
        "chats": [],
        "sheetReference": {"sheet_name": "Sheet1", "row_index": 1, "column_index": 1},
        "enabled": True,
    }

    google_sheet_service.build_sheet_query.assert_called_with(
        **{
            "name": "test2",
            "app_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
            "user_id": "1234",
            "spreadsheet_id": "1wk7863jhstoPkL",
            "query": "Select * from events LIMIT 500",
            "chats": [],
            "sheet_reference": {
                "sheet_name": "Sheet1",
                "row_index": 1,
                "column_index": 1,
            },
        }
    )

    google_sheet_service.update_sheet_query.assert_called()
