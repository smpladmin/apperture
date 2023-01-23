from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
import pytest
from unittest import mock
from domain.apps.service import AppService
from domain.apperture_users.service import AppertureUserService

from server import app
from mongo.mongo import Mongo
from clickhouse import Clickhouse
from rest.middlewares import get_user, get_user_id, validate_jwt, validate_api_key
from domain.notifications.service import NotificationService
from domain.funnels.service import FunnelsService
from domain.datasources.service import DataSourceService
from domain.events.service import EventsService
from domain.edge.service import EdgeService
from domain.segments.service import SegmentService
from domain.properties.service import PropertiesService
from domain.metrics.service import MetricService
from domain.users.service import UserService


@pytest.fixture(scope="module")
def app_init(
    mock_user_id,
    notification_service,
    funnel_service,
    datasource_service,
    events_service,
    apperture_user_service,
    app_service,
    edge_service,
    segment_service,
    properties_service,
    metric_service,
    user_service,
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
    app.dependency_overrides[AppertureUserService] = lambda: apperture_user_service
    app.dependency_overrides[AppService] = lambda: app_service
    app.dependency_overrides[EdgeService] = lambda: edge_service
    app.dependency_overrides[SegmentService] = lambda: segment_service
    app.dependency_overrides[PropertiesService] = lambda: properties_service
    app.dependency_overrides[MetricService] = lambda: metric_service
    app.dependency_overrides[UserService] = lambda: user_service
    FastAPICache.init(backend=InMemoryBackend(), prefix="apperture-cache")
    yield app

    print("Tearing down app")
    FastAPICache.reset()
    app.dependency_overrides = {}


@pytest.fixture(scope="module")
def mock_user_id():
    return "mock-user-id"
