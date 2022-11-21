import pytest
from unittest import mock
from domain.apps.service import AppService
from domain.users.service import UserService

from server import app
from mongo.mongo import Mongo
from clickhouse import Clickhouse
from rest.middlewares import get_user, get_user_id, validate_jwt, validate_api_key
from domain.notifications.service import NotificationService
from domain.funnels.service import FunnelsService
from domain.datasources.service import DataSourceService
from domain.events.service import EventsService


@pytest.fixture(scope="module")
def app_init(
    mock_user_id,
    notification_service,
    funnel_service,
    datasource_service,
    events_service,
    user_service,
    app_service,
):

    print("Setting up App")
    app.dependency_overrides[validate_jwt] = lambda: mock.MagicMock()
    app.dependency_overrides[validate_api_key] = lambda: mock.MagicMock()
    app.dependency_overrides[get_user] = lambda: mock.MagicMock()
    app.dependency_overrides[get_user_id] = lambda: mock_user_id
    app.dependency_overrides[Mongo] = lambda: mock.MagicMock()
    app.dependency_overrides[Clickhouse] = lambda: mock.MagicMock()
    app.dependency_overrides[NotificationService] = lambda: notification_service
    app.dependency_overrides[FunnelsService] = lambda: funnel_service
    app.dependency_overrides[DataSourceService] = lambda: datasource_service
    app.dependency_overrides[EventsService] = lambda: events_service
    app.dependency_overrides[UserService] = lambda: user_service
    app.dependency_overrides[AppService] = lambda: app_service

    yield app

    print("Tearing down app")
    app.dependency_overrides = {}


@pytest.fixture(scope="module")
def mock_user_id():
    return "mock-user-id"
