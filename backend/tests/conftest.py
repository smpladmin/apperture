import pytest
from unittest import mock

from fastapi.testclient import TestClient

from server import app
from mongo.mongo import Mongo
from rest.middlewares import get_user, validate_jwt
from domain.notifications.service import NotificationService


@pytest.fixture()
def client_init(notification_service):
    app.dependency_overrides[validate_jwt] = lambda: mock.MagicMock()
    app.dependency_overrides[get_user] = lambda: mock.MagicMock()
    app.dependency_overrides[Mongo] = lambda: mock.MagicMock()
    app.dependency_overrides[NotificationService] = lambda: notification_service

    return TestClient(app)
