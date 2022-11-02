import pytest
from unittest import mock

from server import app
from mongo.mongo import Mongo
from rest.middlewares import get_user, validate_jwt
from domain.notifications.service import NotificationService


@pytest.fixture(scope="module")
def app_init(notification_service):

    print("Setting up App")
    app.dependency_overrides[validate_jwt] = lambda: mock.MagicMock()
    app.dependency_overrides[get_user] = lambda: mock.MagicMock()
    app.dependency_overrides[Mongo] = lambda: mock.MagicMock()
    app.dependency_overrides[NotificationService] = lambda: notification_service

    yield app

    print("Tearing down app")
    app.dependency_overrides = {}
