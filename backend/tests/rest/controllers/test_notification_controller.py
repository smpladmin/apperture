import asyncio
from beanie import PydanticObjectId

from dotenv import load_dotenv
from domain.notifications.models import (
    Notification,
    NotificationChannel,
    NotificationFrequency,
    NotificationMetric,
    NotificationType,
)
from domain.notifications.service import NotificationService
from mongo.mongo import Mongo

from rest.middlewares import get_user, validate_jwt

load_dotenv(override=False)
from fastapi.testclient import TestClient
from unittest import mock


from server import app


def test_get_notification():
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
    app.dependency_overrides[validate_jwt] = lambda: mock.MagicMock()
    app.dependency_overrides[get_user] = lambda: mock.MagicMock()
    app.dependency_overrides[Mongo] = lambda: mock.MagicMock()
    app.dependency_overrides[NotificationService] = lambda: notification_service_mock

    client = TestClient(app)
    response = client.get("/notifications/?name=notif1")
    print(response.text)
    assert response.status_code == 200
    # assert response.json() == {"msg": "Hello World"}
