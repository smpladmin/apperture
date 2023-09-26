import datetime
import json
from unittest.mock import ANY, AsyncMock

import pytest
from beanie import PydanticObjectId

from domain.apps.models import App, ClickHouseCredential
from domain.spreadsheets.models import (
    ColumnType,
    DatabaseClient,
    SpreadSheetColumn,
    SpreadsheetType,
)


@pytest.mark.asyncio
async def test_compute_transient_spreadsheets_with_credentials(
    client_init,
    spreadsheets_service,
    datasource_service,
    transient_spreadsheet_data,
    app_service,
):
    response = client_init.post(
        "/workbooks/spreadsheets/transient", data=json.dumps(transient_spreadsheet_data)
    )
    assert response.status_code == 200
    assert response.json() == {
        "headers": [SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER)],
        "data": [
            {"event_name": "test_event_1"},
            {"event_name": "test_event_2"},
            {"event_name": "test_event_3"},
            {"event_name": "test_event_4"},
            {"event_name": "test_event_5"},
        ],
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
            "serializeResult": False,
        }
    )
    datasource_service.get_datasource.assert_called_with("23412414123123")
    datasource_service.create_row_policy_for_datasources_by_app.assert_not_called()

    app_service.get_app.assert_called_once_with(
        id=PydanticObjectId("636a1c61d715ca6baae65611")
    )
    app_service.create_clickhouse_user.assert_not_called()


@pytest.mark.asyncio
async def test_compute_transient_spreadsheets(
    client_init,
    spreadsheets_service,
    datasource_service,
    transient_spreadsheet_data,
    app_service,
):
    app_service.get_app = AsyncMock(
        return_value=App(
            id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
            revision_id=None,
            created_at=datetime.datetime(2022, 11, 8, 7, 57, 35, 691000),
            updated_at=datetime.datetime(2022, 11, 8, 7, 57, 35, 691000),
            name="mixpanel1",
            user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
            shared_with=set(),
            clickhouse_credential=None,
        )
    )
    response = client_init.post(
        "/workbooks/spreadsheets/transient", data=json.dumps(transient_spreadsheet_data)
    )
    assert response.status_code == 200
    assert response.json() == {
        "headers": [SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER)],
        "data": [
            {"event_name": "test_event_1"},
            {"event_name": "test_event_2"},
            {"event_name": "test_event_3"},
            {"event_name": "test_event_4"},
            {"event_name": "test_event_5"},
        ],
        "sql": "select * from events",
    }
    spreadsheets_service.get_transient_spreadsheets.assert_called_with(
        **{
            "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)",
            "credential": ClickHouseCredential(
                username="test_username",
                password="test_password",
                databasename="test_database",
            ),
            "client": DatabaseClient.CLICKHOUSE,
            "serializeResult": False,
        }
    )
    datasource_service.get_datasource.assert_called_with("23412414123123")
    datasource_service.create_row_policy_for_datasources_by_app.assert_called_with(
        **{
            "app": App(
                id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
                revision_id=None,
                created_at=datetime.datetime(2022, 11, 8, 7, 57, 35, 691000),
                updated_at=datetime.datetime(2022, 11, 8, 7, 57, 35, 691000),
                name="mixpanel1",
                user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
                shared_with=set(),
                enabled=True,
                clickhouse_credential=None,
            ),
            "username": "test_username",
        }
    )

    app_service.get_app.assert_called_with(
        id=PydanticObjectId("636a1c61d715ca6baae65611")
    )
    app_service.create_clickhouse_user.assert_called_once_with(
        **{
            "id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
            "app_name": "mixpanel1",
        }
    )


@pytest.mark.asyncio
async def test_get_saved_workbooks(client_init, spreadsheets_service):
    response = client_init.get("/workbooks?datasource_id=63d0a7bfc636cee15d81f579")

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
                    "is_sql": True,
                    "query": "SELECT  event_name FROM  events",
                    "subHeaders": None,
                    "edit_mode": True,
                    "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                    "meta": {"dsId": "", "selectedColumns": []},
                    "ai_query": None,
                    "charts": [],
                    "column_format": None,
                }
            ],
            "enabled": True,
            "user": {
                "id": "635ba034807ab86d8a2aadd8",
                "firstName": "Test",
                "lastName": "User",
                "email": "test@email.com",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
                "hasVisitedSheets": False,
            },
        }
    ]
    spreadsheets_service.get_workbooks_for_datasource_id.assert_called_once_with(
        **{"datasource_id": "63d0a7bfc636cee15d81f579"}
    )


@pytest.mark.asyncio
async def test_get_saved_workbooks_for_app(client_init, spreadsheets_service):
    response = client_init.get("/workbooks?app_id=63d0a7bfc636cee15d81f579")

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
                    "is_sql": True,
                    "query": "SELECT  event_name FROM  events",
                    "subHeaders": None,
                    "edit_mode": True,
                    "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                    "meta": {"dsId": "", "selectedColumns": []},
                    "ai_query": None,
                    "charts": [],
                    "column_format": None,
                }
            ],
            "enabled": True,
            "user": {
                "id": "635ba034807ab86d8a2aadd8",
                "firstName": "Test",
                "lastName": "User",
                "email": "test@email.com",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
                "hasVisitedSheets": False,
            },
        }
    ]
    spreadsheets_service.get_workbooks_for_app.assert_called_once()


@pytest.mark.asyncio
async def test_get_saved_workbooks_by_user_id(client_init, spreadsheets_service):
    response = client_init.get("/workbooks")

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
                    "is_sql": True,
                    "subHeaders": None,
                    "query": "SELECT  event_name FROM  events",
                    "edit_mode": True,
                    "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                    "meta": {"dsId": "", "selectedColumns": []},
                    "ai_query": None,
                    "charts": [],
                    "column_format": None,
                }
            ],
            "enabled": True,
            "user": {
                "id": "635ba034807ab86d8a2aadd8",
                "firstName": "Test",
                "lastName": "User",
                "email": "test@email.com",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
                "hasVisitedSheets": False,
            },
        }
    ]
    spreadsheets_service.get_workbooks_for_user_id.assert_called_once()


@pytest.mark.asyncio
async def test_get_saved_workbook_by_id(client_init, spreadsheets_service):
    response = client_init.get("/workbooks/635ba034807ab86d8a2aadd8")
    assert response.status_code == 200
    assert response.json() == {
        "_id": "63d0df1ea1040a6388a4a34c",
        "appId": "63ca46feee94e38b81cda37a",
        "createdAt": ANY,
        "datasourceId": "63d0a7bfc636cee15d81f579",
        "enabled": True,
        "name": "Test Workbook",
        "revisionId": None,
        "spreadsheets": [
            {
                "headers": [{"name": "event_name", "type": "QUERY_HEADER"}],
                "is_sql": True,
                "name": "Sheet1",
                "subHeaders": None,
                "query": "SELECT  event_name FROM  events",
                "edit_mode": True,
                "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                "meta": {"dsId": "", "selectedColumns": []},
                "ai_query": None,
                "charts": [],
                "column_format": None,
            }
        ],
        "updatedAt": None,
        "userId": "6374b74e9b36ecf7e0b4f9e4",
    }

    spreadsheets_service.get_workbook_by_id.assert_called_once_with(
        **{"workbook_id": "635ba034807ab86d8a2aadd8"},
    )


@pytest.mark.asyncio
async def test_create_workbook(client_init, workbook_data):
    response = client_init.post("/workbooks", data=json.dumps(workbook_data))
    assert response.status_code == 200
    assert response.json() == {
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
                "is_sql": True,
                "subHeaders": None,
                "query": "SELECT  event_name FROM  events",
                "edit_mode": True,
                "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                "meta": {"dsId": "", "selectedColumns": []},
                "ai_query": None,
                "charts": [],
                "column_format": None,
            }
        ],
        "enabled": True,
    }


@pytest.mark.asyncio
async def test_update_workbook(client_init, workbook_data, spreadsheets_service):
    response = client_init.put(
        "/workbooks/635ba034807ab86d8a2aadd8", data=json.dumps(workbook_data)
    )
    assert response.status_code == 200
    spreadsheets_service.update_workbook.assert_called_once()

    assert {
        "id": PydanticObjectId("63d0df1ea1040a6388a4a34c"),
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
                "headers": [{"name": "event_name", "type": ColumnType.QUERY_HEADER}],
                "is_sql": True,
                "subHeaders": None,
                "query": "SELECT  event_name FROM  events",
                "edit_mode": True,
                "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                "meta": {"dsId": "", "selectedColumns": []},
                "ai_query": None,
                "column_format": None,
                "charts": [],
            }
        ],
        "enabled": True,
    } == spreadsheets_service.update_workbook.call_args.kwargs["workbook"].dict()


@pytest.mark.asyncio
async def test_delete_workbook(client_init, spreadsheets_service):
    response = client_init.delete("/workbooks/6384a65e0a397236d9de236a")
    assert response.status_code == 200

    spreadsheets_service.delete_workbook.assert_called_once_with(
        **{
            "workbook_id": "6384a65e0a397236d9de236a",
        }
    )


@pytest.mark.asyncio
async def test_vlookup(client_init, spreadsheets_service):
    response = client_init.post(
        "/workbooks/vlookup",
        json={
            "datasourceId": "64c8bd3fc190a9e2973469bd",
            "searchQuery": "select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd'",
            "lookupQuery": "select event_name, user_id from default.events where datasource_id = '64c8bd3fc190a9e2973469bd'",
            "searchKeyColumn": "event_name",
            "lookupColumn": "user_id",
            "lookupIndexColumn": "event_name",
        },
    )
    assert response.status_code == 200
    assert response.json() == ["test1", "test2"]
    spreadsheets_service.compute_vlookup.assert_called_once_with(
        **{
            "credential": ClickHouseCredential(
                username="test_username",
                password="test_password",
                databasename="test_database",
            ),
            "lookup_column": "user_id",
            "lookup_index_column": "event_name",
            "search_column": "event_name",
            "lookup_query": "select event_name, user_id from default.events where "
            "datasource_id = '64c8bd3fc190a9e2973469bd'",
            "search_query": "select event_name, user_id from default.events where "
            "datasource_id = '64c8bd3fc190a9e2973469bd'",
        }
    )
