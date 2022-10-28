import pytest
import asyncio
from unittest import mock
from beanie import PydanticObjectId

from domain.notifications.models import (
    Notification,
    NotificationChannel,
    NotificationFrequency,
    NotificationMetric,
    NotificationType,
)


@pytest.fixture(autouse=True)
def notification_service():
    notification_service_mock = mock.MagicMock()
    Notification.get_settings = mock.MagicMock()
    notif = Notification(
        id=PydanticObjectId(),
        datasource_id=PydanticObjectId(),
        name="name",
        user_id=PydanticObjectId(),
        notification_type=NotificationType.UPDATE,
        metric=NotificationMetric.HITS,
        multi_node=True,
        apperture_managed=True,
        pct_threshold_active=False,
        absolute_threshold_active=False,
        formula="",
        variable_map={},
        frequency=NotificationFrequency.DAILY,
        preferred_hour_gmt=1,
        preferred_channels=[NotificationChannel.SLACK],
        notification_active=False,
    )
    notif_future = asyncio.Future()
    notif_future.set_result(notif)

    notification_service_mock.get_notification_for_node.return_value = notif_future
    return notification_service_mock


@pytest.fixture()
def notification_response():
    return {
        "_id": "635ba034807ab86d8a2aadd8",
        "revisionId": "8fc1083c-0e63-4358-9139-785b77b6236a",
        "createdAt": "2022-10-28T09:26:12.682829",
        "updatedAt": None,
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "userId": "635ba034807ab86d8a2aadda",
        "name": "name",
        "notificationType": "update",
        "metric": "hits",
        "multiNode": True,
        "appertureManaged": True,
        "pctThresholdActive": False,
        "pctThresholdValues": None,
        "absoluteThresholdActive": False,
        "absoluteThresholdValues": None,
        "formula": "",
        "variableMap": {},
        "preferredHourGmt": 1,
        "frequency": "daily",
        "preferredChannels": ["slack"],
        "notificationActive": False,
    }
