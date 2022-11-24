import pytest
import asyncio
from unittest import mock
from datetime import datetime
from beanie import PydanticObjectId
from fastapi.testclient import TestClient

from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion
from domain.funnels.models import (
    Funnel,
    ComputedFunnelStep,
    ComputedFunnel,
    FunnelTrendsData,
)
from domain.notifications.models import (
    Notification,
    NotificationChannel,
    NotificationFrequency,
    NotificationMetric,
    NotificationType,
)
from domain.users.models import User


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
def funnel_service():
    funnel_service_mock = mock.MagicMock()
    Funnel.get_settings = mock.MagicMock()
    funnel = Funnel(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        name="name",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        steps=[
            {
                "event": "Login",
                "filters": [{"property": "mp_country_code", "value": "IN"}],
            },
            {"event": "Chapter_Click"},
            {
                "event": "Topic_Click",
                "filters": [{"property": "os", "value": "Android"}],
            },
        ],
        random_sequence=False,
    )
    funnel_future = asyncio.Future()
    funnel_future.set_result(funnel)

    computed_transient_funnel = [
        ComputedFunnelStep(event="Login", users=956, conversion=100.0),
        ComputedFunnelStep(event="Chapter_Click", users=547, conversion=57.22),
    ]
    computed_funnel = ComputedFunnel(
        datasource_id=funnel.datasource_id,
        name=funnel.name,
        steps=funnel.steps,
        random_sequence=funnel.random_sequence,
        computed_funnel=computed_transient_funnel,
    )
    funnel_trends = [
        FunnelTrendsData(
            conversion=50.00,
            first_step_users=100,
            last_step_users=50,
            start_date=datetime(2022, 1, 1, 0, 0),
            end_date=datetime(2022, 1, 7, 0, 0),
        ),
        FunnelTrendsData(
            conversion=60.00,
            first_step_users=100,
            last_step_users=60,
            start_date=datetime(2022, 1, 8, 0, 0),
            end_date=datetime(2022, 1, 14, 0, 0),
        ),
    ]
    computed_transient_funnel_future = asyncio.Future()
    computed_transient_funnel_future.set_result(computed_transient_funnel)
    computed_funnel_future = asyncio.Future()
    computed_funnel_future.set_result(computed_funnel)
    funnel_trends_future = asyncio.Future()
    funnel_trends_future.set_result(funnel_trends)

    funnel_service_mock.build_funnel.return_value = funnel
    funnel_service_mock.add_funnel.return_value = funnel_future
    funnel_service_mock.get_funnel.return_value = funnel_future
    funnel_service_mock.compute_funnel.return_value = computed_transient_funnel_future
    funnel_service_mock.get_computed_funnel.return_value = computed_funnel_future
    funnel_service_mock.update_funnel = mock.AsyncMock()
    funnel_service_mock.get_funnel_trends.return_value = funnel_trends_future
    return funnel_service_mock


@pytest.fixture(scope="module")
def datasource_service():
    datasource_service_mock = mock.MagicMock()
    DataSource.get_settings = mock.MagicMock()
    datasource = DataSource(
        integration_id="636a1c61d715ca6baae65611",
        app_id="636a1c61d715ca6baae65611",
        user_id="636a1c61d715ca6baae65611",
        provider=IntegrationProvider.MIXPANEL,
        external_source_id="123",
        version=DataSourceVersion.DEFAULT,
    )

    datasource_future = asyncio.Future()
    datasource_future.set_result(datasource)
    datasource_service_mock.get_datasource.return_value = datasource_future
    return datasource_service_mock


@pytest.fixture(scope="module")
def events_service():
    events_service_mock = mock.AsyncMock()
    return events_service_mock


@pytest.fixture(scope="module")
def user_service(mock_find_email_user):
    service = mock.AsyncMock()
    service.find_user.return_value = mock_find_email_user
    return service


@pytest.fixture(scope="module")
def app_service():
    service = mock.AsyncMock()
    future = asyncio.Future()
    service.find_user.return_value = future
    return service


@pytest.fixture(scope="module")
def computed_transient_funnel_response():
    return [
        {"event": "Login", "users": 956, "conversion": 100.0},
        {"event": "Chapter_Click", "users": 547, "conversion": 57.22},
    ]


@pytest.fixture(scope="module")
def computed_funnel_response():
    return {
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "name": "name",
        "steps": [
            {
                "event": "Login",
                "filters": [{"property": "mp_country_code", "value": "IN"}],
            },
            {"event": "Chapter_Click", "filters": None},
            {
                "event": "Topic_Click",
                "filters": [{"property": "os", "value": "Android"}],
            },
        ],
        "randomSequence": False,
        "computedFunnel": [
            {"event": "Login", "users": 956, "conversion": 100.0},
            {"event": "Chapter_Click", "users": 547, "conversion": 57.22},
        ],
    }


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
def funnel_response():
    return {
        "_id": "635ba034807ab86d8a2aadd8",
        "revisionId": "8fc1083c-0e63-4358-9139-785b77b6236a",
        "createdAt": "2022-10-28T09:26:12.682829",
        "updatedAt": None,
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "userId": "635ba034807ab86d8a2aadda",
        "name": "name",
        "steps": [
            {
                "event": "Login",
                "filters": [{"property": "mp_country_code", "value": "IN"}],
            },
            {
                "event": "Chapter_Click",
                "filters": None,
            },
            {
                "event": "Topic_Click",
                "filters": [{"property": "os", "value": "Android"}],
            },
        ],
        "randomSequence": False,
    }


@pytest.fixture(scope="module")
def funnel_trend_response():
    return [
        {
            "conversion": 50.00,
            "firstStepUsers": 100,
            "lastStepUsers": 50,
            "startDate": "2022-01-01T00:00:00",
            "endDate": "2022-01-07T00:00:00",
        },
        {
            "conversion": 60.00,
            "firstStepUsers": 100,
            "lastStepUsers": 60,
            "startDate": "2022-01-08T00:00:00",
            "endDate": "2022-01-14T00:00:00",
        },
    ]


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
            "timestamp": "2019-01-01 00:00:00",
            "provider": IntegrationProvider.MIXPANEL,
            "userId": "123",
            "eventName": "event_a",
            "properties": {},
        },
        {
            "datasourceId": "1234",
            "timestamp": "2019-01-01 00:00:00",
            "provider": IntegrationProvider.MIXPANEL,
            "userId": "123",
            "eventName": "event_b",
            "properties": {"a": "b", "b": "c"},
        },
    ]


@pytest.fixture(scope="module")
def funnel_data():
    return {
        "datasourceId": "636a1c61d715ca6baae65611",
        "name": "test2",
        "steps": [
            {
                "event": "Login",
                "filters": [{"property": "mp_country_code", "value": "IN"}],
            },
            {
                "event": "Chapter_Click",
                "filters": None,
            },
            {
                "event": "Topic_Click",
                "filters": [{"property": "os", "value": "Android"}],
            },
        ],
        "randomSequence": False,
    }


@pytest.fixture(scope="module")
def mock_find_email_user():
    User.get_settings = mock.MagicMock()
    user = User(
        first_name="mock",
        last_name="mock",
        email="test@email.com",
        picture="",
    )
    future = asyncio.Future()
    future.set_result(user)
    return future
