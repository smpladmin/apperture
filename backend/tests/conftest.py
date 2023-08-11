from unittest import mock

import pytest
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

from clickhouse import Clickhouse

from data_processor_queue.service import DPQueueService
from domain.actions.service import ActionService
from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from domain.clickstream.service import ClickstreamService
from domain.clickstream_event_properties.service import (
    ClickStreamEventPropertiesService,
)
from domain.event_properties.service import EventPropertiesService
from rest.middlewares.validate_app_user import validate_library_items_middleware, validate_app_user_middleware

from server import app
from mongo.mongo import Mongo
from clickhouse import Clickhouse
from rest.middlewares import get_user, get_user_id, validate_jwt, validate_api_key
from domain.notifications.service import NotificationService
from domain.funnels.service import FunnelsService
from domain.datasources.service import DataSourceService
from domain.edge.service import EdgeService
from domain.event_properties.service import EventPropertiesService
from domain.events.service import EventsService
from domain.files.service import FilesService
from domain.funnels.service import FunnelsService
from domain.integrations.service import IntegrationService
from domain.metrics.service import MetricService
from domain.notifications.service import NotificationService
from domain.properties.service import PropertiesService
from domain.retention.service import RetentionService
from domain.runlogs.service import RunLogService
from domain.segments.service import SegmentService
from domain.spreadsheets.service import SpreadsheetService
from domain.users.service import UserService
from domain.datamart.service import DataMartService
from mongo.mongo import Mongo
from rest.middlewares import get_user, get_user_id, validate_api_key, validate_jwt
from server import app


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
    integration_service,
    runlog_service,
    dpq_service,
    clickstream_service,
    action_service,
    retention_service,
    event_properties_service,
    spreadsheets_service,
    clickstream_event_properties_service,
    datamart_service,
    files_service,
):
    print("Setting up App")
    app.dependency_overrides[validate_jwt] = lambda: mock.MagicMock()
    app.dependency_overrides[validate_api_key] = lambda: mock.MagicMock()
    app.dependency_overrides[validate_library_items_middleware] = lambda: mock.MagicMock()
    app.dependency_overrides[validate_app_user_middleware] = lambda: mock.MagicMock()
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
    app.dependency_overrides[IntegrationService] = lambda: integration_service
    app.dependency_overrides[RunLogService] = lambda: runlog_service
    app.dependency_overrides[DPQueueService] = lambda: dpq_service
    app.dependency_overrides[ClickstreamService] = lambda: clickstream_service
    app.dependency_overrides[ActionService] = lambda: action_service
    app.dependency_overrides[RetentionService] = lambda: retention_service
    app.dependency_overrides[EventPropertiesService] = lambda: event_properties_service
    app.dependency_overrides[SpreadsheetService] = lambda: spreadsheets_service
    app.dependency_overrides[FilesService] = lambda: files_service
    app.dependency_overrides[
        ClickStreamEventPropertiesService
    ] = lambda: clickstream_event_properties_service
    app.dependency_overrides[DataMartService] = lambda: datamart_service
    FastAPICache.init(backend=InMemoryBackend(), prefix="apperture-cache")
    yield app

    print("Tearing down app")
    FastAPICache.reset()
    app.dependency_overrides = {}


@pytest.fixture(scope="module")
def mock_user_id():
    return "mock-user-id"
