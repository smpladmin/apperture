import json

import pytest


@pytest.mark.asyncio
async def test_compute_transient_spreadsheets(
    client_init, spreadsheets_service, datasource_service, transient_spreadsheet_data
):
    response = client_init.post(
        "/spreadsheets/transient", data=json.dumps(transient_spreadsheet_data)
    )
    assert response.status_code == 200
    assert response.json() == {
        "headers": ["event_name"],
        "data": [
            {"index": 1, "event_name": "test_event_1"},
            {"index": 2, "event_name": "test_event_2"},
            {"index": 3, "event_name": "test_event_3"},
            {"index": 4, "event_name": "test_event_4"},
            {"index": 5, "event_name": "test_event_5"},
        ],
    }
    assert spreadsheets_service.get_transient_spreadsheets.called_once_with(
        **{
            "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)",
            "username": "test_user",
            "password": "test_password",
        }
    )
    assert datasource_service.get_datasource.called_once_with("23412414123123")
