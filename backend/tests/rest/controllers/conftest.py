import pytest
import asyncio
from unittest import mock
from beanie import PydanticObjectId
from fastapi.testclient import TestClient

from domain.notifications.models import (
    Notification,
    NotificationChannel,
    NotificationFrequency,
    NotificationMetric,
    NotificationType,
)
from domain.common.models import IntegrationProvider


@pytest.fixture(scope="module")
def client_init(app_init):
    print("Running tests for controllers")
    test_client = TestClient(app_init)
    yield test_client


@pytest.fixture(scope="module")
def notification_service():
    notification_service_mock = mock.MagicMock()
    Notification.get_settings = mock.MagicMock()
    notif = Notification(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        name="name",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        notification_type=NotificationType.UPDATE,
        metric=NotificationMetric.HITS,
        multi_node=True,
        apperture_managed=True,
        pct_threshold_active=False,
        absolute_threshold_active=False,
        formula="",
        variable_map={},
        frequency=NotificationFrequency.DAILY,
        preferred_hour_gmt=5,
        preferred_channels=[NotificationChannel.SLACK],
        notification_active=False,
    )
    notif_future = asyncio.Future()
    notif_future.set_result(notif)

    notification_service_mock.build_notification.return_value = notif
    notification_service_mock.add_notification.return_value = notif_future
    notification_service_mock.update_notification.return_value = notif_future
    notification_service_mock.get_notification_for_node.return_value = notif_future
    return notification_service_mock


@pytest.fixture(scope="module")
def notification_response():
    return {
        "_id": "635ba034807ab86d8a2aadd8",
        "revisionId": "8fc1083c-0e63-4358-9139-785b77b6236a",
        "createdAt": "2022-10-28T09:26:12.682829",
        "updatedAt": None,
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "userId": "635ba034807ab86d8a2aadda",
        "name": "name",
        "notificationType": NotificationType.UPDATE,
        "metric": NotificationMetric.HITS,
        "multiNode": True,
        "appertureManaged": True,
        "pctThresholdActive": False,
        "pctThresholdValues": None,
        "absoluteThresholdActive": False,
        "absoluteThresholdValues": None,
        "formula": "",
        "variableMap": {},
        "preferredHourGmt": 5,
        "frequency": NotificationFrequency.DAILY,
        "preferredChannels": [NotificationChannel.SLACK],
        "notificationActive": False,
    }


@pytest.fixture(scope="module")
def notification_data():
    return {
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "name": "name",
        "notificationType": NotificationType.UPDATE,
        "metric": NotificationMetric.HITS,
        "multiNode": True,
        "appertureManaged": True,
        "pctThresholdActive": False,
        "pctThresholdValues": None,
        "absoluteThresholdActive": False,
        "absoluteThresholdValues": None,
        "formula": "",
        "variableMap": {},
        "preferredHourGMT": 5,
        "frequency": NotificationFrequency.DAILY,
        "preferredChannels": [NotificationChannel.SLACK],
        "notificationActive": False,
    }


@pytest.fixture(scope="module")
def events_data():
    return [
        {
            "datasourceId": "1234",
            "provider": IntegrationProvider.MIXPANEL,
            "timestamp": "2019-01-01 00:00:00.000000",
            "eventName": "event_a",
            "properties": {},
        },
        {
            "datasourceId": "1234",
            "provider": IntegrationProvider.MIXPANEL,
            "timestamp": "2019-01-01 00:00:00.000000",
            "eventName": "event_b",
            "properties": {"a": "b", "b": "c"},
        },
    ]
