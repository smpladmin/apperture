from unittest.mock import ANY

import pytest
import asyncio
from unittest import mock
from datetime import datetime
from beanie import PydanticObjectId
from fastapi.testclient import TestClient

from domain.apps.models import App
from domain.common.models import IntegrationProvider, SavedItems, WatchlistItemType
from domain.datasources.models import DataSource, DataSourceVersion
from domain.properties.models import Properties, Property, PropertyDataType
from domain.segments.models import (
    ComputedSegment,
    Segment,
    WhereSegmentFilter,
    SegmentFilterOperators,
    SegmentFilterConditions,
    SegmentGroup,
    SegmentGroupConditions,
)
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
    ThresholdMap,
)

from domain.metrics.models import (
    ComputedMetricResult,
)
from domain.users.models import User
from domain.edge.models import Edge, NodeSignificance, NodeTrend, NodeSankey


@pytest.fixture(scope="module")
def client_init(app_init):
    print("Running tests for controllers")
    test_client = TestClient(app_init)
    yield test_client


@pytest.fixture(scope="module")
def notification_service():
    notification_service_mock = mock.MagicMock()
    Notification.get_settings = mock.MagicMock()
    saved_notif = [
        SavedItems(
            type=WatchlistItemType.NOTIFICATIONS,
            details=Notification(
                id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
                created_at=datetime(2022, 12, 1, 7, 4, 59, 390000),
                updated_at=datetime(2022, 12, 1, 7, 4, 59, 390000),
                datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
                user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
                app_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
                name="/p/partner/job",
                notification_type=NotificationType.ALERT,
                metric=NotificationMetric.HITS,
                multi_node=False,
                apperture_managed=False,
                pct_threshold_active=False,
                pct_threshold_values=None,
                absolute_threshold_active=True,
                absolute_threshold_values=ThresholdMap(min=26.0, max=381.0),
                formula="a",
                variable_map={"a": ["/p/partner/job"]},
                preferred_hour_gmt=5,
                frequency=NotificationFrequency.DAILY,
                preferred_channels=[NotificationChannel.SLACK],
                notification_active=True,
            ),
        )
    ]
    notif = Notification(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        app_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
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

    saved_notif_future = asyncio.Future()
    saved_notif_future.set_result(saved_notif)

    notification_service_mock.build_notification.return_value = notif
    notification_service_mock.add_notification.return_value = notif_future
    notification_service_mock.update_notification.return_value = notif_future
    notification_service_mock.get_notification_for_node.return_value = notif_future
    notification_service_mock.get_notifications_for_apps.return_value = (
        saved_notif_future
    )
    return notification_service_mock


@pytest.fixture(scope="module")
def funnel_service():
    funnel_service_mock = mock.MagicMock()
    Funnel.get_settings = mock.MagicMock()
    funnel = Funnel(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        app_id=PydanticObjectId("635ba034807ab86d8a2aadd7"),
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
    datasource.id = PydanticObjectId("636a1c61d715ca6baae65611")

    datasource_future = asyncio.Future()
    datasource_future.set_result(datasource)
    datasource_service_mock.get_datasource.return_value = datasource_future
    return datasource_service_mock


@pytest.fixture(scope="module")
def events_service():
    events_service_mock = mock.AsyncMock()
    events_service_mock.get_values_for_property = mock.MagicMock(
        return_value=[["Philippines"], ["Hong Kong"]]
    )
    return events_service_mock


@pytest.fixture(scope="module")
def user_service(mock_find_email_user):
    service = mock.AsyncMock()
    service.find_user.return_value = mock_find_email_user
    return service


@pytest.fixture(scope="module")
def properties_service():
    properties_service = mock.AsyncMock()
    Properties.get_settings = mock.MagicMock()
    properties = Properties(
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        properties=[
            Property(name="prop1", type=PropertyDataType.DEFAULT),
            Property(name="prop2", type=PropertyDataType.DEFAULT),
        ],
    )
    properties_service.fetch_properties.return_value = ["prop1", "prop2"]
    properties_service.refresh_properties.return_value = properties
    properties_service.refresh_properties_for_all_datasources.return_value = None
    return properties_service


@pytest.fixture(scope="module")
def metric_service():
    metric_service = mock.AsyncMock()
    computed_metric = ComputedMetricResult(
        metric=[
            {"date": "2022-10-07", "value": 4},
            {"date": "2022-10-08", "value": 26},
            {"date": "2022-10-09", "value": 11},
            {"date": "2022-10-10", "value": 14},
            {"date": "2022-10-11", "value": 22},
            {"date": "2022-10-12", "value": 33},
        ]
    )
    metric_service.compute_metric.return_value = computed_metric
    return metric_service


@pytest.fixture(scope="module")
def segment_service():
    segment_service = mock.AsyncMock()
    Segment.get_settings = mock.MagicMock()
    computed_segment = ComputedSegment(
        count=2,
        data=[
            {
                "user_id": "3313e47d-bcfa-4d84-8f7e-6e6e2e33ae72",
                "properties.$app_release": "5003",
                "properties.$city": "Indore",
            },
            {
                "user_id": "rudragurjar2912@gmail.com",
                "properties.$app_release": "5003",
                "properties.$city": "Indore",
            },
        ],
    )
    filters = [
        WhereSegmentFilter(
            operator=SegmentFilterOperators.EQUALS,
            operand="properties.$city",
            values=["Delhi", "Indore", "Bhopal"],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.WHERE,
        ),
        WhereSegmentFilter(
            operator=SegmentFilterOperators.EQUALS,
            operand="properties.$app_release",
            values=["5003", "2077", "5002"],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.AND,
        ),
    ]
    groups = [SegmentGroup(filters=filters, condition=SegmentGroupConditions.AND)]
    columns = ["properties.$app_release", "properties.$city"]
    segment = Segment(
        name="name",
        description="test",
        datasource_id="63771fc960527aba9354399c",
        user_id="63771fc960527aba9354399c",
        app_id="63771fc960527aba9354399c",
        groups=groups,
        columns=columns,
    )
    segment_service.compute_segment.return_value = computed_segment
    segment_service.build_segment.return_value = segment
    segment_future = asyncio.Future()
    segment_future.set_result(segment)
    segment_service.add_segment.return_value = segment
    segment_service.update_segment.return_value = segment
    segment_service.get_segment.return_value = segment
    segment_service.get_segments_for_app.return_value = [segment]
    return segment_service


@pytest.fixture(scope="module")
def app_service():
    app_service_mock = mock.MagicMock()
    App.get_settings = mock.MagicMock()
    apps = [
        App(
            id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
            revision_id=None,
            created_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
            updated_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
            name="mixpanel1",
            user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
            shared_with=set(),
        )
    ]
    user_future = asyncio.Future()
    app_service_mock.find_user.return_value = user_future
    app_service_mock.share_app = mock.AsyncMock()
    apps_future = asyncio.Future()
    apps_future.set_result(apps)
    app_service_mock.get_apps.return_value = apps_future
    return app_service_mock


@pytest.fixture(scope="module")
def edge_service():
    edge_service_mock = mock.MagicMock()
    Edge.get_settings = mock.MagicMock()
    node_significance = [
        NodeSignificance(
            node="Video_Open",
            node_hits=39268,
            total_hits=374844,
            node_users=8922,
            total_users=28882,
        )
    ]
    node_trends = [
        NodeTrend(
            node="test",
            year=2022,
            trend=1,
            users=1111,
            hits=6483,
            start_date=datetime.strptime("2022-11-06", "%Y-%m-%d"),
            end_date=datetime.strptime("2022-11-12", "%Y-%m-%d"),
        ),
        NodeTrend(
            node="test",
            year=2022,
            trend=2,
            users=1371,
            hits=6972,
            start_date=datetime.strptime("2022-11-13", "%Y-%m-%d"),
            end_date=datetime.strptime("2022-11-19", "%Y-%m-%d"),
        ),
    ]
    node_sankey = [
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="inflow1",
            hits=10,
            users=8,
            flow="inflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="inflow2",
            hits=10,
            users=8,
            flow="inflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="inflow3",
            hits=10,
            users=8,
            flow="inflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="Exits",
            hits=10,
            users=8,
            flow="inflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="Others",
            hits=10,
            users=8,
            flow="inflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="outflow1",
            hits=10,
            users=8,
            flow="outflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="outflow2",
            hits=10,
            users=8,
            flow="outflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="outflow3",
            hits=10,
            users=8,
            flow="outflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="outflow4",
            hits=10,
            users=8,
            flow="outflow",
            hits_percentage=10,
            users_percentage=12,
        ),
        NodeSankey(
            node="test",
            current_event="test",
            previous_event="Others",
            hits=10,
            users=8,
            flow="outflow",
            hits_percentage=10,
            users_percentage=12,
        ),
    ]
    node_significance_future = asyncio.Future()
    node_significance_future.set_result(node_significance)
    edge_service_mock.get_node_significance.return_value = node_significance_future
    node_trends_future = asyncio.Future()
    node_trends_future.set_result(node_trends)
    edge_service_mock.get_node_trends.return_value = node_trends_future
    node_sankey_future = asyncio.Future()
    node_sankey_future.set_result(node_sankey)
    edge_service_mock.get_node_sankey.return_value = node_sankey_future
    return edge_service_mock


@pytest.fixture(scope="module")
def node_significance_response():
    return [
        {
            "node": "Video_Open",
            "nodeHits": 39268,
            "totalHits": 374844,
            "nodeUsers": 8922,
            "totalUsers": 28882,
        }
    ]


@pytest.fixture(scope="module")
def saved_segment_response():
    return {
        "_id": None,
        "appId": "63771fc960527aba9354399c",
        "columns": ["properties.$app_release", "properties.$city"],
        "createdAt": ANY,
        "datasourceId": "63771fc960527aba9354399c",
        "description": "test",
        "groups": [
            {
                "condition": "and",
                "filters": [
                    {
                        "all": False,
                        "condition": "where",
                        "operand": "properties.$city",
                        "operator": "equals",
                        "type": "where",
                        "values": ["Delhi", "Indore", "Bhopal"],
                    },
                    {
                        "all": False,
                        "condition": "and",
                        "operand": "properties.$app_release",
                        "operator": "equals",
                        "type": "where",
                        "values": ["5003", "2077", "5002"],
                    },
                ],
            }
        ],
        "name": "name",
        "revisionId": ANY,
        "updatedAt": None,
        "userId": "63771fc960527aba9354399c",
    }


@pytest.fixture(scope="module")
def node_sankey_response():
    return [
        {
            "currentEvent": "test",
            "flow": "inflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "inflow1",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "inflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "inflow2",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "inflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "inflow3",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "inflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "Exits",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "inflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "Others",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "outflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "outflow1",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "outflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "outflow2",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "outflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "outflow3",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "outflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "outflow4",
            "users": 8,
            "usersPercentage": 12.0,
        },
        {
            "currentEvent": "test",
            "flow": "outflow",
            "hits": 10,
            "hitsPercentage": 10.0,
            "node": "test",
            "previousEvent": "Others",
            "users": 8,
            "usersPercentage": 12.0,
        },
    ]


@pytest.fixture(scope="module")
def node_trends_response():
    return [
        {
            "node": "test",
            "users": 1111,
            "hits": 6483,
            "year": 2022,
            "trend": 1,
            "startDate": "2022-11-06T00:00:00",
            "endDate": "2022-11-12T00:00:00",
        },
        {
            "node": "test",
            "users": 1371,
            "hits": 6972,
            "year": 2022,
            "trend": 2,
            "startDate": "2022-11-13T00:00:00",
            "endDate": "2022-11-19T00:00:00",
        },
    ]


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
        "appId": "635ba034807ab86d8a2aadd9",
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
def saved_notification_response():
    return [
        {
            "type": "notifications",
            "details": {
                "_id": "635ba034807ab86d8a2aadd8",
                "created_at": "2022-12-01T07:04:59.390000",
                "updated_at": "2022-12-01T07:04:59.390000",
                "datasource_id": "635ba034807ab86d8a2aadd9",
                "user_id": "635ba034807ab86d8a2aadda",
                "app_id": "635ba034807ab86d8a2aadd9",
                "name": "/p/partner/job",
                "notification_type": "alert",
                "metric": "hits",
                "multi_node": False,
                "apperture_managed": False,
                "pct_threshold_active": False,
                "pct_threshold_values": None,
                "absolute_threshold_active": True,
                "absolute_threshold_values": {"min": 26.0, "max": 381.0},
                "formula": "a",
                "variable_map": {"a": ["/p/partner/job"]},
                "preferred_hour_gmt": 5,
                "frequency": "daily",
                "preferred_channels": ["slack"],
                "notification_active": True,
            },
        }
    ]


@pytest.fixture(scope="module")
def funnel_response():
    return {
        "_id": "635ba034807ab86d8a2aadd8",
        "appId": "635ba034807ab86d8a2aadd7",
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
def computed_segment_response():
    return {
        "count": 2,
        "data": [
            {
                "properties.$app_release": "5003",
                "properties.$city": "Indore",
                "user_id": "3313e47d-bcfa-4d84-8f7e-6e6e2e33ae72",
            },
            {
                "properties.$app_release": "5003",
                "properties.$city": "Indore",
                "user_id": "rudragurjar2912@gmail.com",
            },
        ],
    }


@pytest.fixture(scope="module")
def computed_metric_response():
    return {
        "metric": [
            {"date": "2022-10-07", "value": 4},
            {"date": "2022-10-08", "value": 26},
            {"date": "2022-10-09", "value": 11},
            {"date": "2022-10-10", "value": 14},
            {"date": "2022-10-11", "value": 22},
            {"date": "2022-10-12", "value": 33},
        ]
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
        "appId": "636a1c61d715ca6baae65611",
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
def transient_segment_data():
    return {
        "datasourceId": "63771fc960527aba9354399c",
        "groups": [
            {
                "filters": [
                    {
                        "operand": "properties.$city",
                        "operator": "equals",
                        "values": ["Delhi", "Indore", "Bhopal"],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.WHERE,
                        "all": False,
                    },
                    {
                        "operand": "properties.$app_release",
                        "operator": "equals",
                        "values": ["5003", "2077", "5002"],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.AND,
                        "all": False,
                    },
                ],
                "condition": "and",
            }
        ],
        "columns": ["properties.$app_release", "properties.$city"],
    }


@pytest.fixture(scope="module")
def compute_metric_request():
    return {
        "datasourceId": "638f1aac8e54760eafc64d70",
        "function": "A",
        "aggregates": [
            {
                "variable": "A",
                "reference_id": "Video_Seen",
                "function": "count",
                "variant": "event",
                "filters": [
                    {
                        "operator": "equals",
                        "operand": "properties.$city",
                        "values": ["Bengaluru"],
                    }
                ],
                "conditions": ["where"],
                "aggregations": {"functions": "count", "property": "Video_Seen"},
            }
        ],
        "breakdown": [],
    }


@pytest.fixture(scope="module")
def segment_data():
    return {
        "name": "name",
        "description": "test",
        "datasourceId": "63771fc960527aba9354399c",
        "groups": [
            {
                "filters": [
                    {
                        "operand": "properties.$city",
                        "operator": "equals",
                        "values": ["Delhi", "Indore", "Bhopal"],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.WHERE,
                        "all": False,
                    },
                    {
                        "operand": "properties.$app_release",
                        "operator": "equals",
                        "values": ["5003", "2077", "5002"],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.AND,
                        "all": False,
                    },
                ],
                "condition": "and",
            }
        ],
        "columns": ["properties.$app_release", "properties.$city"],
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
