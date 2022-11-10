import pytest
from unittest import mock

from server import app
from mongo.mongo import Mongo
from clickhouse import Clickhouse
from rest.middlewares import get_user, validate_jwt, validate_api_key
from domain.notifications.service import NotificationService
from domain.funnels.service import FunnelsService


@pytest.fixture(scope="module")
def app_init(notification_service, funnel_service):

    print("Setting up App")
    app.dependency_overrides[validate_jwt] = lambda: mock.MagicMock()
    app.dependency_overrides[validate_api_key] = lambda: mock.MagicMock()
    app.dependency_overrides[get_user] = lambda: mock.MagicMock()
    app.dependency_overrides[Mongo] = lambda: mock.MagicMock()
    app.dependency_overrides[Clickhouse] = lambda: mock.MagicMock()
    app.dependency_overrides[NotificationService] = lambda: notification_service
    app.dependency_overrides[FunnelsService] = lambda: funnel_service

    yield app

    print("Tearing down app")
    app.dependency_overrides = {}
