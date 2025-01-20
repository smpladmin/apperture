import pytest
from unittest.mock import patch, MagicMock
from models.models import ClickHouseCredentials
from event_logs_datasources import (
    EventLogsDatasources,
)


mock_datasources_response = [
    {"_id": "datasource_id_1", "appId": "app_id_1"},
    {"_id": "datasource_id_2", "appId": "app_id_2"},
]

mock_app_response = {
    "clickhouseCredential": {"databasename": "test_db"},
    "remoteConnection": ClickHouseCredentials(
        host="test_host", port=9000, username="test_user", password="test_pass"
    ),
}


@pytest.fixture
def mock_get(mocker):
    return mocker.patch("event_logs_datasources.get")


def test_get_event_logs_datasources(mock_get):
    mock_get.side_effect = [
        MagicMock(
            json=MagicMock(return_value=mock_datasources_response)
        ),  # For datasources API
        MagicMock(
            json=MagicMock(return_value=mock_app_response)
        ),  # For app details (app_id_1)
        MagicMock(
            json=MagicMock(return_value=mock_app_response)
        ),  # For app details (app_id_2)
    ]

    event_logs_datasources = EventLogsDatasources()
    event_logs_datasources.get_event_logs_datasources()

    # Assertions
    assert len(event_logs_datasources.datasource_with_credentials) == 2
    assert (
        "eventlogs_datasource_id_1_v2"
        in event_logs_datasources.datasource_with_credentials
    )
    assert (
        "eventlogs_datasource_id_2_v2"
        in event_logs_datasources.datasource_with_credentials
    )

    bucket_1 = event_logs_datasources.datasource_with_credentials[
        "eventlogs_datasource_id_1_v2"
    ]
    bucket_2 = event_logs_datasources.datasource_with_credentials[
        "eventlogs_datasource_id_2_v2"
    ]

    assert bucket_1.ch_db == "test_db"
    assert bucket_1.ch_server_credential == ClickHouseCredentials(
        host="test_host", port=9000, username="test_user", password="test_pass"
    )
    assert bucket_1.app_id == "app_id_1"

    assert bucket_2.ch_db == "test_db"
    assert bucket_2.ch_server_credential == ClickHouseCredentials(
        host="test_host", port=9000, username="test_user", password="test_pass"
    )
    assert bucket_2.app_id == "app_id_2"

    assert event_logs_datasources.topics == [
        "eventlogs_datasource_id_1_v2",
        "eventlogs_datasource_id_2_v2",
    ]
