import asyncio
import datetime
import json

import pytest
from beanie import PydanticObjectId

from domain.apps.models import App, ClickHouseCredential
from domain.spreadsheets.models import ColumnType, SpreadSheetColumn


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
            {"index": 1, "event_name": "test_event_1"},
            {"index": 2, "event_name": "test_event_2"},
            {"index": 3, "event_name": "test_event_3"},
            {"index": 4, "event_name": "test_event_4"},
            {"index": 5, "event_name": "test_event_5"},
        ],
    }
    spreadsheets_service.get_transient_spreadsheets.assert_called_once_with(
        **{
            "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)",
            "username": "test_username",
            "password": "test_password",
        }
    )
    datasource_service.get_datasource.assert_called_once_with("23412414123123")
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
    response = client_init.post(
        "/workbooks/spreadsheets/transient", data=json.dumps(transient_spreadsheet_data)
    )
    assert response.status_code == 200
    assert response.json() == {
        "headers": [SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER)],
        "data": [
            {"index": 1, "event_name": "test_event_1"},
            {"index": 2, "event_name": "test_event_2"},
            {"index": 3, "event_name": "test_event_3"},
            {"index": 4, "event_name": "test_event_4"},
            {"index": 5, "event_name": "test_event_5"},
        ],
    }
    spreadsheets_service.get_transient_spreadsheets.assert_called_with(
        **{
            "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)",
            "username": "test_username",
            "password": "test_password",
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
        **{"id": PydanticObjectId("635ba034807ab86d8a2aadd9"), "app_name": "mixpanel1"}
    )
