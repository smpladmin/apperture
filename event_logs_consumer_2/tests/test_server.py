import datetime
import pytest
from server import save_topic_data_to_clickhouse
from unittest.mock import ANY


@pytest.fixture
def mock_clickhouse(mocker):
    return mocker.MagicMock()


@pytest.fixture
def mock_event_logs_datasources(mocker):
    mock_datasource = {"test_topic": mocker.MagicMock()}
    mock_datasource["test_topic"].ch_table = "test_table"
    mock_datasource["test_topic"].ch_db = "test_db"
    mock_datasource["test_topic"].ch_server_credential = "test_server_credential"
    mock_datasource["test_topic"].app_id = "test_app_id"
    mock_datasource["test_topic"].data = [
        {
            "eventName": "string",
            "addedTime": "string",
            "table": "string",
            "mobile": "string",
            "task_id": "string",
            "account_id": "string",
            "key": "string",
            "data": {},
            "datasource_id": "65f054793306aa5f711b8ca2",
        },  # This entry should be filtered out
        {
            "eventName": "address_updated",
            "addedTime": "2024-03-11 10:03:06",
            "table": "test_booking_vanilla",
            "mobile": "448157355",
            "task_id": "string",
            "account_id": "string",
            "key": "448157355",
            "data": {
                "address": '{"home":"369","street":"renew buy office","address":"98, Roshan Pura, Gurugram, Haryana 122001, India","pincode":"122001","city":"Gurugram"}'
            },
            "datasource_id": "65f054793306aa5f711b8ca2",
        },  # This entry should be included
    ]
    mock_event_logs = mocker.MagicMock()
    mock_event_logs.datasource_with_credentials = mock_datasource
    return mock_event_logs


def test_filtering_on_key(mock_clickhouse, mock_event_logs_datasources):
    save_topic_data_to_clickhouse(mock_clickhouse, mock_event_logs_datasources)
    expected_events = [
        [
            "address_updated",  # event_name
            datetime.datetime(2024, 3, 11, 10, 3, 6),  # added_time
            "test_booking_vanilla",  # table
            "448157355",  # mobile
            "string",  # task_id
            "string",  # account_id
            "448157355",  # key
            {
                "address": '{"home":"369","street":"renew buy office","address":"98, Roshan Pura, Gurugram, Haryana 122001, India","pincode":"122001","city":"Gurugram"}'
            },  # data
            "65f054793306aa5f711b8ca2",  # datasource_id
        ]
    ]
    mock_clickhouse.save_events.assert_called_with(
        events=expected_events,
        columns=[
            "event_name",
            "added_time",
            "table",
            "mobile",
            "task_id",
            "account_id",
            "key",
            "data",
            "datasource_id",
        ],
        table="test_table",
        database="test_db",
        clickhouse_server_credential="test_server_credential",
        app_id="test_app_id",
    )
