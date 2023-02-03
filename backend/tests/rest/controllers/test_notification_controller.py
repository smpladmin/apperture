import json
from unittest.mock import ANY
from beanie import PydanticObjectId

from domain.notifications.models import (
    NotificationType,
    NotificationMetric,
    NotificationFrequency,
    NotificationChannel,
    NotificationVariant
)
from tests.utils import filter_response


def test_get_notification_for_node(
    client_init, notification_service, notification_response
):
    response = client_init.get(
        "/notifications/?name=name&ds_id=635ba034807ab86d8a2aadd9"
    )
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
    assert filter_response(response.json()) == filter_response(notification_response)

    notification_service.get_notification_for_node.assert_called_once_with(
        **{"ds_id": "635ba034807ab86d8a2aadd9", "name": "name"}
    )


def test_get_notification_for_user(
    client_init, notification_service, saved_notification_response
):
    response = client_init.get("/notifications")
    assert response.status_code == 200
    response = response.json()
    assert [filter_response(res["details"]) for res in response] == [
        filter_response(res["details"]) for res in saved_notification_response
    ]
    assert [res["type"] for res in response] == [
        res["type"] for res in saved_notification_response
    ]

    notification_service.get_notifications_for_apps.assert_called_once_with(
        **{"app_ids": [PydanticObjectId("635ba034807ab86d8a2aadd9")]}
    )


def test_add_notification(
    client_init, notification_data, notification_service, notification_response
):
    response = client_init.post("/notifications", data=json.dumps(notification_data))
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
    assert filter_response(response.json()) == filter_response(notification_response)
    notification_service.build_notification.assert_called()
    notification_service.add_notification.assert_called_once()
    assert notification_service.build_notification.call_args.kwargs == {
        "absoluteThresholdActive": False,
        "absoluteThresholdValues": None,
        "appId": PydanticObjectId("636a1c61d715ca6baae65611"),
        "appertureManaged": True,
        "datasourceId": PydanticObjectId("636a1c61d715ca6baae65611"),
        "formula": "",
        "frequency": NotificationFrequency.DAILY,
        "metric": NotificationMetric.HITS,
        "multiNode": True,
        "name": "name",
        "notificationActive": False,
        "notificationType": NotificationType.UPDATE,
        "pctThresholdActive": False,
        "pctThresholdValues": None,
        "preferredChannels": [NotificationChannel.SLACK],
        "preferredHourGMT": 5,
        "userId": ANY,
        "variableMap": {},
        'reference': '/p/partner/job',
        'variant':NotificationVariant.NODE
    }
    assert notification_service.add_notification.call_args.kwargs[
        "notification"
    ].dict() == {
        "absolute_threshold_active": False,
        "absolute_threshold_values": None,
        "app_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "apperture_managed": True,
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "formula": "",
        "frequency": NotificationFrequency.DAILY,
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "metric": NotificationMetric.HITS,
        "multi_node": True,
        "name": "name",
        "notification_active": False,
        "notification_type": NotificationType.UPDATE,
        "pct_threshold_active": False,
        "pct_threshold_values": None,
        "preferred_channels": [NotificationChannel.SLACK],
        "preferred_hour_gmt": 5,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
        "variable_map": {},
        'reference': '/p/partner/job',
        'variant':NotificationVariant.NODE
    }


def test_update_notification(
    client_init, notification_data, notification_service, notification_response
):
    response = client_init.put(
        "/notifications/635ba034807ab86d8a2aadd8", data=json.dumps(notification_data)
    )
    assert response.status_code == 200
    assert response.json().keys() == notification_response.keys()
    assert filter_response(response.json()) == filter_response(notification_response)
    notification_service.build_notification.assert_called()
    notification_service.update_notification.assert_called_once()
    assert notification_service.build_notification.call_args.kwargs == {
        "absoluteThresholdActive": False,
        "absoluteThresholdValues": None,
        "appId": PydanticObjectId("636a1c61d715ca6baae65611"),
        "appertureManaged": True,
        "datasourceId": PydanticObjectId("636a1c61d715ca6baae65611"),
        "formula": "",
        "frequency": NotificationFrequency.DAILY,
        "name": "name",
        "notificationActive": False,
        "notificationType": NotificationType.UPDATE,
        "pctThresholdActive": False,
        "pctThresholdValues": None,
        "preferredChannels": [NotificationChannel.SLACK],
        "preferredHourGMT": 5,
        "userId": ANY,
        "variableMap": {},
    }

    assert notification_service.update_notification.call_args.kwargs[
        "new_notification"
    ].dict() == {
        "absolute_threshold_active": False,
        "absolute_threshold_values": None,
        "app_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "apperture_managed": True,
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "formula": "",
        "frequency": NotificationFrequency.DAILY,
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "metric": NotificationMetric.HITS,
        "multi_node": True,
        "name": "name",
        "notification_active": False,
        "notification_type": NotificationType.UPDATE,
        "pct_threshold_active": False,
        "pct_threshold_values": None,
        "preferred_channels": [NotificationChannel.SLACK],
        "preferred_hour_gmt": 5,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
        "variable_map": {},
        'reference': '/p/partner/job',
        'variant':NotificationVariant.NODE
    }
    assert (
        notification_service.update_notification.call_args.kwargs["notification_id"]
        == "635ba034807ab86d8a2aadd8"
    )
