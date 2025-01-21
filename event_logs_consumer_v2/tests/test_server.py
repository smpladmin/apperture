import datetime
import json
import pytest
from server import (
    save_topic_data_to_clickhouse,
    format_date_string_to_desired_format,
    fetch_values_from_kafka_records,
)
from unittest.mock import ANY, MagicMock


@pytest.fixture
def mock_clickhouse(mocker):
    return mocker.MagicMock()


@pytest.fixture
def mock_event_logs_datasources(mocker):
    mock_datasource = {"test_topic": mocker.MagicMock()}
    mock_datasource["test_topic"].ch_db = "test_db"
    mock_datasource["test_topic"].ch_server_credential = "test_server_credential"
    mock_datasource["test_topic"].app_id = "test_app_id"
    mock_datasource["test_topic"].table_data = {
        "booking_logs": [
            {
                "eventName": "booking",
                "addedTime": "string",
                "table": "booking_logs",
                "mobile": "string",
                "task_id": "string",
                "account_id": "string",
                "key": "string",
                "data": {},
                "datasource_id": "65f054793306aa5f711b8ca2",
            },
            {
                "eventName": "address_updated",
                "addedTime": "2024-03-11 10:03:06",
                "table": "booking_logs",
                "mobile": "448157355",
                "task_id": "string",
                "account_id": "string",
                "key": "448157355",
                "data": {
                    "address": '{"home":"369","street":"renew buy office","address":"98, Roshan Pura, Gurugram, Haryana 122001, India","pincode":"122001","city":"Gurugram"}'
                },
                "datasource_id": "65f054793306aa5f711b8ca2",
            },  # This entry should be included
        ],
        "task_logs": [
            {
                "eventName": "task",
                "addedTime": "string",
                "table": "task_logs",
                "mobile": "string",
                "task_id": "string",
                "account_id": "string",
                "key": "string",
                "data": {},
                "datasource_id": "65f054793306aa5f711b8ca2",
            }
        ],
        "ticket_logs": [],
    }
    mock_event_logs = mocker.MagicMock()
    mock_event_logs.datasource_with_credentials = mock_datasource
    return mock_event_logs


@pytest.fixture
def mock_kafka_records(mocker):
    # Mock Kafka records
    return {
        "partition_0": [
            MagicMock(
                topic="test_topic",
                value=json.dumps(
                    {
                        "eventName": "address_updated",
                        "addedTime": "2024-03-11 10:03:06",
                        "table": "booking_logs",
                        "mobile": "448157355",
                        "task_id": "string",
                        "account_id": "string",
                        "key": "448157355",
                        "data": {
                            "address": '{"home":"369","street":"renew buy office","address":"98, Roshan Pura, Gurugram, Haryana 122001, India","pincode":"122001","city":"Gurugram"}'
                        },
                        "datasource_id": "65f054793306aa5f711b8ca2",
                    }
                ),
            ),
            MagicMock(
                topic="test_topic",
                value=json.dumps(
                    {
                        "eventName": "task",
                        "addedTime": "string",
                        "table": "task_logs",
                        "mobile": "string",
                        "task_id": "string",
                        "account_id": "string",
                        "key": "string",
                        "data": {},
                        "datasource_id": "65f054793306aa5f711b8ca2",
                    }
                ),
            ),
        ]
    }


def test_save_data_to_clickhouse(mocker, mock_clickhouse, mock_event_logs_datasources):
    save_topic_data_to_clickhouse(mock_clickhouse, mock_event_logs_datasources)
    expected_create_table_calls = [
        mocker.call(
            database="test_db",
            table="booking_logs",
            clickhouse_server_credential="test_server_credential",
            app_id="test_app_id",
        ),
        mocker.call(
            database="test_db",
            table="task_logs",
            clickhouse_server_credential="test_server_credential",
            app_id="test_app_id",
        ),
    ]
    mock_clickhouse.create_table.assert_has_calls(
        expected_create_table_calls, any_order=True
    )
    assert (
        mock_clickhouse.save_events.call_count == 2
    )  # once with booking_logs and once with task logs, not for ticket_logs
    expected_booking_logs_events = [
        [
            "booking",
            None,
            "booking_logs",
            "string",
            "string",
            "string",
            "string",
            "{}",
            "65f054793306aa5f711b8ca2",
            None,
        ],
        [
            "address_updated",
            datetime.datetime(2024, 3, 11, 10, 3, 6),
            "booking_logs",
            "448157355",
            "string",
            "string",
            "448157355",
            '{"address": "{\\"home\\":\\"369\\",\\"street\\":\\"renew buy office\\",\\"address\\":\\"98, Roshan Pura, Gurugram, Haryana 122001, India\\",\\"pincode\\":\\"122001\\",\\"city\\":\\"Gurugram\\"}"}',
            "65f054793306aa5f711b8ca2",
            None,
        ],
    ]
    expected_task_logs_events = [
        [
            "task",
            None,
            "task_logs",
            "string",
            "string",
            "string",
            "string",
            "{}",
            "65f054793306aa5f711b8ca2",
            None,
        ]
    ]
    mock_clickhouse.save_events.assert_any_call(
        events=expected_booking_logs_events,
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
            "source_flag",
        ],
        table="booking_logs",
        database="test_db",
        clickhouse_server_credential="test_server_credential",
        app_id="test_app_id",
    )
    mock_clickhouse.save_events.assert_any_call(
        events=expected_task_logs_events,
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
            "source_flag",
        ],
        table="task_logs",
        database="test_db",
        clickhouse_server_credential="test_server_credential",
        app_id="test_app_id",
    )


@pytest.mark.parametrize(
    "input_date_str, expected_output",
    [
        ("2023-01-01T12:00:00Z", datetime.datetime(2023, 1, 1, 12, 0, 0, 0)),
        (
            "2023-01-01T12:00:00.123456Z",
            datetime.datetime(2023, 1, 1, 12, 0, 0, 123456),
        ),
        ("2023-01-01 12:00:00", datetime.datetime(2023, 1, 1, 12, 0, 0)),
        ("2023-01-01", datetime.datetime(2023, 1, 1)),
        (None, None),
    ],
)
def test_format_date_string_to_desired_format(input_date_str, expected_output):
    result = format_date_string_to_desired_format(
        input_date_str, "%Y-%m-%d %H:%M:%S.%f"
    )
    assert result == expected_output


def test_fetch_values_from_kafka_records(mocker, mock_kafka_records):
    mock_datasource = {"test_topic": mocker.MagicMock()}
    mock_datasource["test_topic"].table_data = {}
    mock_event_logs_datasources = mocker.MagicMock()
    mock_event_logs_datasources.datasource_with_credentials = mock_datasource

    fetch_values_from_kafka_records(mock_kafka_records, mock_event_logs_datasources)

    table_data = mock_event_logs_datasources.datasource_with_credentials[
        "test_topic"
    ].table_data
    assert "booking_logs" in table_data
    assert "task_logs" in table_data
    assert len(table_data["booking_logs"]) == 1
    assert len(table_data["task_logs"]) == 1
