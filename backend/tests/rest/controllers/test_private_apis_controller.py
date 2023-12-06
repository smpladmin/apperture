import json
from datetime import datetime
from unittest.mock import ANY, call
import asyncio


from beanie import PydanticObjectId
import pytest
from domain.datamart.models import DataMart, GoogleSheet, Spreadsheet

from domain.apps.models import ClickHouseCredential
from domain.notifications.models import (
    NotificationData,
    NotificationVariant,
    ThresholdMap,
    NotificationType,
)
from domain.spreadsheets.models import DatabaseClient
from rest.dtos.clickstream_event_properties import ClickStreamEventPropertiesDto
from rest.dtos.event_properties import EventPropertiesDto

from rest.dtos.events import CreateEventDto
from domain.common.models import IntegrationProvider


def test_update_events(client_init, events_service, events_data):
    data = [list(d.values()) for d in events_data]
    response = client_init.post("/private/events", data=json.dumps(data))
    assert response.status_code == 200
    events_service.update_events.assert_called_once_with(
        [
            CreateEventDto(
                datasourceId="1234",
                timestamp=datetime(2019, 1, 1, 0, 0),
                provider=IntegrationProvider.MIXPANEL,
                userId="123",
                eventName="event_a",
                properties={},
            ),
            CreateEventDto(
                datasourceId="1234",
                timestamp=datetime(2019, 1, 1, 0, 0),
                provider=IntegrationProvider.MIXPANEL,
                userId="123",
                eventName="event_b",
                properties={"a": "b", "b": "c"},
            ),
        ],
    )


def test_refresh_properties(client_init, properties_service):
    response = client_init.put("/private/properties?ds_id=635ba034807ab86d8a2aadd9")
    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "createdAt": ANY,
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "properties": [
            {"name": "prop1", "type": "default"},
            {"name": "prop2", "type": "default"},
        ],
        "revisionId": ANY,
        "updatedAt": None,
    }
    properties_service.refresh_properties.assert_called_once_with(
        **{"ds_id": "635ba034807ab86d8a2aadd9"}
    )

    response1 = client_init.put("/private/properties")
    assert response1.status_code == 200
    properties_service.refresh_properties_for_all_datasources.assert_called_once()


def test_update_events_from_clickstream(client_init, action_service):
    response = client_init.post(
        "/private/click_stream?datasource_id=63e4da53370789982002e57d"
    )
    assert response.status_code == 200
    assert response.json() == {"updated": "63e4da53370789982002e57d"}
    action_service.update_events_from_clickstream.assert_called_once_with(
        **{"datasource_id": "63e4da53370789982002e57d"}
    )

    response1 = client_init.post("/private/click_stream")
    assert response1.status_code == 200
    assert response1.json() == {"updated": ["636a1c61d715ca6baae65611"]}
    calls = [call(datasource_id="636a1c61d715ca6baae65611")]
    action_service.update_events_from_clickstream.assert_has_calls(
        calls=calls, any_order=True
    )


def test_get_notifications(
    client_init, notification_service, funnel_service, metric_service
):
    response = client_init.get(
        "/private/notifications?user_id='63e4da53370789982002e57d'"
    )
    assert response.status_code == 200
    assert response.json() == [
        {
            "name": "Video Funnel",
            "notification_id": "633fb88bbbc29934eeb39ece",
            "notification_type": NotificationType.ALERT,
            "original_value": 0.1,
            "threshold_type": "pct",
            "trigger": True,
            "reference": "639237437483490",
            "user_threshold": {"max": 18.0, "min": 12.0},
            "value": -16.67,
            "variant": "funnel",
        },
        {
            "name": "Alert Metric -Updated",
            "notification_id": "633fb88bbbc29934eeb39ece",
            "notification_type": NotificationType.ALERT,
            "original_value": 0.1,
            "reference": "6777439823920337",
            "threshold_type": "pct",
            "trigger": False,
            "user_threshold": {"max": 3236.0, "min": 1212.0},
            "value": -16.67,
            "variant": "metric",
        },
        {
            "name": "Video Funnel",
            "notification_id": "633fb88bbbc29934eeb39ece",
            "notification_type": NotificationType.UPDATE,
            "original_value": 0.1,
            "reference": "639237437483490",
            "threshold_type": None,
            "trigger": None,
            "user_threshold": None,
            "value": -16.67,
            "variant": "funnel",
        },
        {
            "name": "Alert Metric -Updated",
            "notification_id": "633fb88bbbc29934eeb39ece",
            "notification_type": NotificationType.UPDATE,
            "original_value": 0.1,
            "reference": "6777439823920337",
            "threshold_type": None,
            "trigger": None,
            "user_threshold": None,
            "value": -16.67,
            "variant": "metric",
        },
    ]
    notification_service.compute_alerts.assert_called_with(
        [
            NotificationData(
                name="Video Funnel",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.FUNNEL,
                value=0.2,
                prev_day_value=0.2,
                reference="639237437483490",
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=12.0, max=18.0),
            ),
            NotificationData(
                name="Alert Metric -Updated",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.METRIC,
                value=0.2,
                prev_day_value=0.2,
                reference="6777439823920337",
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=1212.0, max=3236.0),
            ),
        ],
    )
    notification_service.compute_updates.assert_called_with(
        [
            NotificationData(
                name="Video Funnel",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.FUNNEL,
                value=0.2,
                prev_day_value=0.2,
                reference="639237437483490",
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=12.0, max=18.0),
            ),
            NotificationData(
                name="Alert Metric -Updated",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.METRIC,
                value=0.2,
                prev_day_value=0.2,
                reference="6777439823920337",
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=1212.0, max=3236.0),
            ),
        ],
    )


def test_post_notifications(client_init, notification_service, dpq_service):
    response = client_init.post("/private/notifications")
    assert response.json() == [
        {"job": "a98a10b4-d26e-46fa-aa6f", "user_id": "6374b74e9b36ecf7e0b4f9e4"}
    ]
    dpq_service.enqueue_user_notification.assert_called_with("6374b74e9b36ecf7e0b4f9e4")


def test_update_event_properties(
    client_init, event_properties_service, event_properties_data
):
    response = client_init.post(
        "/private/event_properties",
        data=json.dumps(event_properties_data),
    )
    assert response.json() == {"updated": True}
    event_properties_service.update_event_properties.assert_called_once_with(
        **{
            "event_properties": EventPropertiesDto(
                datasource_id="63ce4906f496f7b462ab7e94",
                event="test-event",
                properties=["prop1", "prop4", "prop3"],
                provider="mixpanel",
            ),
        }
    )


def test_get_event_properties(client_init, event_properties_service):
    response = client_init.get("/private/event_properties")
    assert response.json() == [
        {
            "_id": None,
            "createdAt": ANY,
            "datasourceId": "63ce4906f496f7b462ab7e94",
            "event": "test",
            "properties": [
                {"name": "prop1", "type": "string"},
                {"name": "prop4", "type": "string"},
                {"name": "prop3", "type": "string"},
            ],
            "provider": "mixpanel",
            "revisionId": None,
            "updatedAt": None,
        },
        {
            "_id": None,
            "createdAt": ANY,
            "datasourceId": "63ce4906f496f7b462ab7e94",
            "event": "test2",
            "properties": [
                {"name": "prop1", "type": "string"},
                {"name": "prop4", "type": "string"},
                {"name": "prop3", "type": "string"},
            ],
            "provider": "mixpanel",
            "revisionId": None,
            "updatedAt": None,
        },
        {
            "_id": None,
            "createdAt": ANY,
            "datasourceId": "63ce4906f496f7b462ab7e84",
            "event": "test",
            "properties": [
                {"name": "prop1", "type": "string"},
                {"name": "prop4", "type": "string"},
                {"name": "prop3", "type": "string"},
            ],
            "provider": "mixpanel",
            "revisionId": None,
            "updatedAt": None,
        },
    ]
    event_properties_service.get_event_properties.assert_called_once()


def test_update_clickstream_event_properties(
    client_init, clickstream_event_properties_service, clickstream_event_properties_data
):
    response = client_init.post(
        "/private/clickstream_event_properties",
        data=json.dumps(clickstream_event_properties_data),
    )
    assert response.json() == {"updated": True}
    clickstream_event_properties_service.update_event_properties.assert_called_once_with(
        **{
            "event_properties": ClickStreamEventPropertiesDto(
                event="$autocapture", properties=["prop1", "prop4", "prop3"]
            )
        }
    )


def test_get_clickstream_event_properties(
    client_init, clickstream_event_properties_service
):
    response = client_init.get("/private/clickstream_event_properties")
    assert response.json() == [
        {
            "_id": None,
            "createdAt": ANY,
            "event": "$autocapture",
            "properties": [
                {"name": "prop1", "type": "string"},
                {"name": "prop4", "type": "string"},
                {"name": "prop3", "type": "string"},
            ],
            "revisionId": None,
            "updatedAt": None,
        },
        {
            "_id": None,
            "createdAt": ANY,
            "event": "$pageview",
            "properties": [
                {"name": "prop1", "type": "string"},
                {"name": "prop4", "type": "string"},
                {"name": "prop3", "type": "string"},
            ],
            "revisionId": None,
            "updatedAt": None,
        },
    ]
    clickstream_event_properties_service.get_event_properties.assert_called_once()


def test_trigger_refresh_datamart_for_all_apps(
    client_init, datamart_service, dpq_service
):
    response = client_init.post("/private/apps/datamart")
    assert response.status_code == 200
    assert response.json() == [
        {"app_id": "635ba034807ab86d8a2aadd8", "jobs": "a98a10b4-d26e-46fa-aa6g"},
        {"app_id": "63ce4906f496f7b462ab7e84", "jobs": "a98a10b4-d26e-46fa-aa6g"},
    ]
    datamart_service.get_all_apps_with_datamarts.assert_called_once()
    dpq_service.enqueue_refresh_datamart_for_app.assert_has_calls(
        calls=[call("635ba034807ab86d8a2aadd8"), call("63ce4906f496f7b462ab7e84")],
        any_order=True,
    )


def test_push_to_sheet_success(
    client_init,
    datamart_service,
):
    datamart = DataMart(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        app_id=PydanticObjectId("635ba034807ab86d8a2aadd7"),
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        name="name",
        table_name="dUKQaHtqxM",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        last_refreshed=datetime(2022, 11, 24, 0, 0),
        query="select event_name, user_id from events",
        enabled=True,
        refresh_token="44110/g-Vkq",
        google_sheet=GoogleSheet(
            enable_sheet_push=True,
            spreadsheet=Spreadsheet(id="1vwpp022-383kl", name="Test Spreadsheet"),
            sheet_range="Sheet1!A1",
        ),
    )
    datamart_future = asyncio.Future()
    datamart_future.set_result(datamart)

    datamart_service.get_datamart_table.return_value = datamart_future

    response = client_init.post(
        "/private/datamart?target=google_sheet",
        data=json.dumps({"datamartId": "635ba034807ab86d8a2aadd8"}),
    )
    assert response.status_code == 200

    datamart_service.get_datamart_table.assert_called_with(
        id="635ba034807ab86d8a2aadd8"
    )
    datamart_service.push_to_google_sheet.assert_awaited_once_with(
        refresh_token="44110/g-Vkq",
        google_sheet=GoogleSheet(
            enable_sheet_push=True,
            spreadsheet=Spreadsheet(id="1vwpp022-383kl", name="Test Spreadsheet"),
            sheet_range="Sheet1!A1",
        ),
        columns=["event_name"],
        data=[
            ("test_event_1",),
            ("test_event_2",),
            ("test_event_3",),
            ("test_event_4",),
            ("test_event_5",),
        ],
    )


@pytest.mark.asyncio
async def test_refresh_datamart_tables_success(
    client_init,
    datamart_service,
):
    datamart_service.refresh_datamart_table.return_value = True
    response = client_init.post(
        "/private/datamart/refresh",
        data=json.dumps(
            {
                "datamartId": "635ba034807ab86d8a2aadd8",
                "appId": "635ba034807ab86d8a2aadd7",
                "databaseClient": "clickhouse",
                "databaseCredential": {
                    "username": "test_username",
                    "password": "test_password",
                    "databasename": "test_database",
                },
            }
        ),
    )
    assert response.status_code == 200
    datamart_service.refresh_datamart_table.assert_awaited_once_with(
        datamart_id="635ba034807ab86d8a2aadd8",
        clickhouse_credential=ClickHouseCredential(
            username="test_username",
            password="test_password",
            databasename="test_database",
        ),
        db_creds=ClickHouseCredential(
            username="test_username",
            password="test_password",
            databasename="test_database",
        ),
        database_client=DatabaseClient.CLICKHOUSE,
    )
    assert response.json() is True


@pytest.mark.asyncio
async def test_refresh_datamart_tables_failure(
    client_init,
    datamart_service,
):
    datamart_service.refresh_datamart_table.return_value = False

    with pytest.raises(Exception) as exc_info:
        response = client_init.post(
            "/private/datamart/refresh",
            data=json.dumps(
                {
                    "datamartId": "635ba034807ab86d8a2aadd8",
                    "appId": "635ba034807ab86d8a2aadd7",
                    "databaseClient": "clickhouse",
                    "databaseCredential": {
                        "username": "test_username",
                        "password": "test_password",
                        "databasename": "test_database",
                    },
                }
            ),
        )
        assert response.status_code == 200
    assert (
        str(exc_info.value)
    ) == "Could not refresh datamart 635ba034807ab86d8a2aadd8"
