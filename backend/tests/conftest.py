

import pytest

from dotenv import load_dotenv 

from domain.notifications.service import NotificationService

load_dotenv(override=False)
from fastapi.testclient import TestClient
from unittest import mock

from server import app
from domain.notifications.service import NotificationService
from mongo.mongo import Mongo
 
from rest.middlewares import get_user, validate_jwt 

@pytest.fixture()
def test_client_init(notification_service): 
    app.dependency_overrides[validate_jwt] = lambda: mock.MagicMock()
    app.dependency_overrides[get_user] = lambda: mock.MagicMock()
    app.dependency_overrides[Mongo] = lambda: mock.MagicMock()
    app.dependency_overrides[NotificationService] = lambda: notification_service

    client = TestClient(app)
    return client
