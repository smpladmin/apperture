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


@pytest.fixture()
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
        "_id": "635a901a7f012968a44de3bc",
        "revision_id": "b48909c5-39ee-4c6d-a2d6-1d589d6fb964",
        "created_at": "2022-10-27T14:05:14.587885",
        "updated_at": None,
        "datasource_id": "635a901a7f012968a44de3bd",
        "user_id": "635a901a7f012968a44de3be",
        "name": "name",
        "notification_type": "update",
        "metric": "hits",
        "multi_node": True,
        "apperture_managed": True,
        "pct_threshold_active": False,
        "pct_threshold_values": None,
        "absolute_threshold_active": False,
        "absolute_threshold_values": None,
        "formula": "",
        "variable_map": {},
        "preferred_hour_gmt": 1,
        "frequency": "daily",
        "preferred_channels": ["slack"],
        "notification_active": False,
    }
