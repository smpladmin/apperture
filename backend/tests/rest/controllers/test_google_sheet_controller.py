import json
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
            "serializeResult": True,
            "query_id": None,
        }
    )


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
