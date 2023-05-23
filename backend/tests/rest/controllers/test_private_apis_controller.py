import json
from datetime import datetime
from unittest.mock import ANY, call

from beanie import PydanticObjectId
from domain.notifications.models import (
    NotificationData,
    NotificationVariant,
    ThresholdMap,
    NotificationType,
)
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
        "/private/event_properties/63ce4906f496f7b462ab7e94",
        data=json.dumps(event_properties_data),
    )
    assert response.json() == {"updated": True}
    event_properties_service.update_event_properties.assert_called_once_with(
        **{
            "datasource_id": "63ce4906f496f7b462ab7e94",
            "event_properties": EventPropertiesDto(
                event="test-event",
                properties=["prop1", "prop4", "prop3"],
                provider="mixpanel",
            ),
        }
    )
