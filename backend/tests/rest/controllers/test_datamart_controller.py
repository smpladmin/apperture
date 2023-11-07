import json
from datetime import datetime
from unittest.mock import ANY

import pytest
from beanie import PydanticObjectId

from domain.apps.models import ClickHouseCredential
from domain.spreadsheets.models import DatabaseClient
from tests.utils import filter_response


def test_save_datamart_table(
    client_init, datamart_service, datamart_data, datamart_response
):
    response = client_init.post("/datamart", data=json.dumps(datamart_data))
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(datamart_response)
    datamart_service.build_datamart_table.assert_called_with(
        **{
            "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
            "name": "test-table",
            "query": "select event_name, user_id from events",
            "user_id": "mock-user-id",
        }
    )
    assert datamart_service.create_datamart_table.call_args.kwargs["table"].dict() == {
        "app_id": PydanticObjectId("635ba034807ab86d8a2aadd7"),
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "enabled": True,
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "last_refreshed": datetime(2022, 11, 24, 0, 0),
        "name": "name",
        "table_name": "dUKQaHtqxM",
        "query": "select event_name, user_id from events",
        "revision_id": None,
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
    }


def test_get_datamart(client_init, datamart_service, datamart_response):
    response = client_init.get("/datamart/635ba034807ab86d8a2aadd8")
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(datamart_response)

    datamart_service.get_datamart_table.assert_called_once_with(
        **{"id": "635ba034807ab86d8a2aadd8"}
    )


@pytest.mark.asyncio
async def test_update_datamart(
    client_init,
    datamart_data,
    app_service,
    datasource_service,
    datamart_response,
    datamart_service,
    mock_user_id,
):
    response = client_init.put(
        "/datamart/635ba034807ab86d8a2aadd8", data=json.dumps(datamart_data)
    )
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(datamart_response)
    datasource_service.get_datasource.assert_called_with(
        "635ba034807ab86d8a2aadd9",
    )
    datamart_service.build_datamart_table.assert_called_with(
        **{
            "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
            "name": "test-table",
            "query": "select event_name, user_id from events",
            "user_id": "mock-user-id",
        }
    )

    update_datamart_kwargs = datamart_service.update_datamart_table.call_args.kwargs
    datamart_service.update_datamart_table.assert_called_once()

    assert {
        "app_id": PydanticObjectId("635ba034807ab86d8a2aadd7"),
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "enabled": True,
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "last_refreshed": datetime(2022, 11, 24, 0, 0),
        "name": "name",
        "table_name": "dUKQaHtqxM",
        "query": "select event_name, user_id from events",
        "revision_id": None,
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
    } == update_datamart_kwargs["new_table"].dict()

    assert "635ba034807ab86d8a2aadd8" == update_datamart_kwargs["table_id"]
    assert update_datamart_kwargs["clickhouse_credential"] == ClickHouseCredential(
        username="test_username", password="test_password", databasename="test_database"
    )


def test_compute_transient_datamart(
    client_init,
    datamart_transient_data,
    transient_datamart_response,
    datamart_service,
    spreadsheets_service,
):
    response = client_init.post(
        "/datamart/transient",
        data=json.dumps(datamart_transient_data),
    )
    assert response.status_code == 200
    assert response.json() == transient_datamart_response

    spreadsheets_service.get_transient_spreadsheets.assert_called_once_with(
        **{
            "query": "select event_name, user_id from events",
            "credential": ClickHouseCredential(
                username="test_username",
                password="test_password",
                databasename="test_database",
            ),
            "client": DatabaseClient.CLICKHOUSE,
            "query_id": None,
            "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        }
    )


def test_get_datamart_list(client_init, datamart_service):
    response = client_init.get("/datamart?datasource_id=635ba034807ab86d8a2aadd9")

    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": "635ba034807ab86d8a2aadd8",
            "appId": "635ba034807ab86d8a2aadd7",
            "createdAt": ANY,
            "datasourceId": "635ba034807ab86d8a2aadd9",
            "enabled": True,
            "lastRefreshed": "2022-11-24T00:00:00",
            "name": "name",
            "tableName": "dUKQaHtqxM",
            "query": "select event_name, user_id from events",
            "revisionId": None,
            "updatedAt": None,
            "user": {
                "email": "test@email.com",
                "firstName": "Test",
                "id": "635ba034807ab86d8a2aadd8",
                "lastName": "User",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
                "hasVisitedSheets": False,
            },
            "userId": "635ba034807ab86d8a2aadda",
        }
    ]
    datamart_service.get_datamart_tables_for_app_id.assert_called_once_with(
        **{"app_id": PydanticObjectId("636a1c61d715ca6baae65611")}
    )


def test_delete_datamart(client_init, datamart_service, app_service):
    response = client_init.delete("/datamart/6384a65e0a397236d9de236a")
    assert response.status_code == 200

    datamart_service.delete_datamart_table.assert_called_once_with(
        **{
            "clickhouse_credential": ClickHouseCredential(
                username="test_username",
                password="test_password",
                databasename="test_database",
            ),
            "datamart_id": "6384a65e0a397236d9de236a",
            "table_name": "dUKQaHtqxM",
        }
    )

    datamart_service.get_datamart_table.assert_called_with(
        **{"id": "6384a65e0a397236d9de236a"}
    )
    app_service.get_app.assert_called_with(**{"id": "635ba034807ab86d8a2aadd7"})
