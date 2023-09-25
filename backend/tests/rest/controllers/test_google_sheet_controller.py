import json
from domain.apps.models import ClickHouseCredential

from domain.spreadsheets.models import ColumnType, DatabaseClient, SpreadSheetColumn


def test_compute_transient_result(
    client_init, spreadsheets_service, transient_spreadsheet_data
):
    response = client_init.post(
        "/apperture/google-sheets/transient",
        data=json.dumps(transient_spreadsheet_data),
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
        }
    )
