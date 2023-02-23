import asyncio
from datetime import datetime
from unittest import mock
from unittest.mock import ANY

import pytest
from beanie import PydanticObjectId
from fastapi.testclient import TestClient

from domain.actions.models import (
    Action,
    ActionGroup,
    CaptureEvent,
    ComputedEventStreamResult,
)
from domain.apperture_users.models import AppertureUser
from domain.apps.models import App
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion
from domain.edge.models import Edge, NodeSankey, NodeSignificance, NodeTrend
from domain.events.models import Event, EventsData
from domain.funnels.models import (
    ComputedFunnel,
    ComputedFunnelStep,
    Funnel,
    FunnelConversionData,
    FunnelEventUserData,
    FunnelTrendsData,
)
from domain.integrations.models import Credential, CredentialType, Integration
from domain.metrics.models import (
    Metric,
    ComputedMetricStep,
    ComputedMetricData,
    MetricValue,
)
from domain.notifications.models import (
    Notification,
    NotificationChannel,
    NotificationFrequency,
    NotificationMetric,
    NotificationType,
    NotificationVariant,
)
from domain.properties.models import Properties, Property, PropertyDataType
from domain.runlogs.models import RunLog
from domain.segments.models import (
    ComputedSegment,
    Segment,
    SegmentDataType,
    SegmentFilterConditions,
    SegmentFilterOperatorsNumber,
    SegmentFilterOperatorsString,
    SegmentGroup,
    SegmentGroupConditions,
    WhereSegmentFilter,
)
from domain.users.models import UserDetails
from rest.dtos.actions import ComputedActionResponse
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.funnels import FunnelWithUser
from rest.dtos.metrics import MetricWithUser
from rest.dtos.notifications import NotificationWithUser
from rest.dtos.segments import SegmentWithUser


@pytest.fixture(scope="module")
def client_init(app_init):
    print("Running tests for controllers")
    test_client = TestClient(app_init)
    yield test_client


@pytest.fixture(scope="module")
def apperture_user_response():
    AppertureUserResponse.from_orm = mock.MagicMock(
        return_value=AppertureUserResponse(
            firstName="Test",
            lastName="User",
            email="test@email.com",
            picture="https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
            slackChannel="#alerts",
        )
    )


@pytest.fixture(scope="module")
def notification_service(apperture_user_response):
    notification_service_mock = mock.MagicMock()
    Notification.get_settings = mock.MagicMock()
    notif = Notification(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        app_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        name="name",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        notification_type=[NotificationType.UPDATE],
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
        variant=NotificationVariant.NODE,
        reference="/p/partner/job",
    )
    notif_future = asyncio.Future()
    notif_future.set_result(notif)

    notifications_future = asyncio.Future()
    notifications_future.set_result([NotificationWithUser.from_orm(notif)])

    notification_service_mock.build_notification.return_value = notif
    notification_service_mock.add_notification.return_value = notif_future
    notification_service_mock.update_notification.return_value = notif_future
    notification_service_mock.get_notification_by_reference.return_value = notif_future
    notification_service_mock.get_notifications_for_datasource_id.return_value = (
        notifications_future
    )
    return notification_service_mock


@pytest.fixture(scope="module")
def funnel_service(apperture_user_response):
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
                "filters": None,
            },
            {"event": "Chapter_Click"},
            {
                "event": "Topic_Click",
                "filters": None,
            },
        ],
        random_sequence=False,
    )
    funnel_future = asyncio.Future()
    funnel_future.set_result(funnel)

    funnels_future = asyncio.Future()
    funnels_future.set_result([FunnelWithUser.from_orm(funnel)])

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

    funnel_user_conversion = FunnelConversionData(
        users=[FunnelEventUserData(id="user_1"), FunnelEventUserData(id="user_2")],
        total_users=2,
        unique_users=2,
    )

    computed_transient_funnel_future = asyncio.Future()
    computed_transient_funnel_future.set_result(computed_transient_funnel)
    computed_funnel_future = asyncio.Future()
    computed_funnel_future.set_result(computed_funnel)
    funnel_trends_future = asyncio.Future()
    funnel_trends_future.set_result(funnel_trends)
    funnel_user_conversion_future = asyncio.Future()
    funnel_user_conversion_future.set_result(funnel_user_conversion)

    funnel_service_mock.build_funnel.return_value = funnel
    funnel_service_mock.add_funnel.return_value = funnel_future
    funnel_service_mock.get_funnel.return_value = funnel_future
    funnel_service_mock.compute_funnel.return_value = computed_transient_funnel_future
    funnel_service_mock.get_computed_funnel.return_value = computed_funnel_future
    funnel_service_mock.update_funnel = mock.AsyncMock()
    funnel_service_mock.get_funnel_trends.return_value = funnel_trends_future
    funnel_service_mock.get_user_conversion.return_value = funnel_user_conversion_future
    funnel_service_mock.get_funnels_for_datasource_id.return_value = funnels_future
    funnel_service_mock.get_funnels_for_apps.return_value = funnels_future

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
    datasources_future = asyncio.Future()
    datasources_future.set_result([datasource])
    datasource_service_mock.get_datasource.return_value = datasource_future
    datasource_service_mock.create_datasource.return_value = datasource_future
    datasource_service_mock.get_datasources_for_apperture.return_value = (
        datasource_future
    )
    datasource_service_mock.get_datasources_for_provider.return_value = (
        datasources_future
    )
    return datasource_service_mock


@pytest.fixture(scope="module")
def clickstream_service():
    clickstream_service_mock = mock.AsyncMock()
    clickstream_service_mock.update_events = mock.AsyncMock()
    clickstream_service_mock.get_data_by_id = mock.MagicMock(
        return_value={
            "count": 2,
            "data": [
                {
                    "event": "$pageview",
                    "timestamp": "2023-02-09T04:50:47",
                    "uid": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "url": "http://localhost:3000/analytics/app/create",
                    "source": "web",
                },
                {
                    "event": "$pageview",
                    "timestamp": "2023-02-07T08:45:13",
                    "uid": "1862a9e52121a37-0b39b9498d8c54-16525635-16a7f0-1862a9e521328fa",
                    "url": "http://localhost:3000/analytics/funnel/list/63d8ef5a7b02dbd1dcf20dcc",
                    "source": "web",
                },
            ],
        }
    )
    return clickstream_service_mock


@pytest.fixture(scope="module")
def action_service():
    action_service_mock = mock.MagicMock()
    Action.get_settings = mock.MagicMock()
    action = Action(
        datasource_id="63e4da53370789982002e57d",
        app_id="63e4da53370789982002e57d",
        user_id="63e4da53370789982002e57d",
        name="clicked on settings",
        groups=[
            ActionGroup(
                selector="#__next > div > div.css-3h169z > div.css-8xl60i > button"
            )
        ],
        event_type=CaptureEvent.AUTOCAPTURE,
    )
    computed_action_response = ComputedActionResponse(
        count=1,
        data=[
            ComputedEventStreamResult(
                event="$autocapture",
                timestamp="2023-02-09T10:26:22",
                uid="18635b641091067-0b29b2c45f4c5d-16525635-16a7f0-18635b6410a285c",
                url="http://localhost:3000/analytics/explore/63e236e89343884e21e0a07c",
                source="web",
            )
        ],
    )
    action_future = asyncio.Future()
    action_future.set_result(action)
    actions_future = asyncio.Future()
    actions_future.set_result([action])
    computed_action_future = asyncio.Future()
    computed_action_future.set_result(computed_action_response)

    action_service_mock.build_action.return_value = action
    action_service_mock.add_action.return_value = action_future
    action_service_mock.get_actions_for_datasource_id.return_value = actions_future
    action_service_mock.update_events_from_clickstream.return_value = action_future
    action_service_mock.update_action.return_value = action_future
    action_service_mock.get_action.return_value = action_future
    action_service_mock.compute_action.return_value = computed_action_future
    return action_service_mock


@pytest.fixture(scope="module")
def events_service():
    events_service_mock = mock.AsyncMock()
    events_service_mock.get_values_for_property = mock.MagicMock(
        return_value=[["Philippines"], ["Hong Kong"]]
    )
    events_service_mock.get_events = mock.MagicMock(
        return_value=EventsData(
            count=2,
            data=[
                Event(
                    name="Content_Like",
                    timestamp=datetime(2023, 1, 13, 15, 23, 38),
                    user_id="mthdas8@gmail.com",
                    city="Delhi",
                ),
                Event(
                    name="WebView_Open",
                    timestamp=datetime(2023, 1, 13, 15, 23, 41),
                    user_id="mthdas8@gmail.com",
                    city="Delhi",
                ),
            ],
        )
    )
    return events_service_mock


@pytest.fixture(scope="module")
def apperture_user_service(mock_find_email_user):
    service = mock.AsyncMock()
    service.find_user.return_value = mock_find_email_user
    return service


@pytest.fixture(scope="module")
def user_service():
    service = mock.AsyncMock()
    user_details = UserDetails(
        user_id="user_id",
        datasource_id="datasource_id",
        property=dict(
            {
                "$insert_id": "33ba7915-444f-4b91-9541-a49334a5a72e",
                "$insert_key": "006a3255bb6bfa3e095a499cd0e0807c9a#832",
                "$schema": 13,
                "amplitude_id": 502527487487,
                "app": 281811,
                "city": "Lapu-Lapu City",
            }
        ),
    )
    user_details_future = asyncio.Future()
    user_details_future.set_result(user_details)

    service.get_user_properties.return_value = user_details

    return service


@pytest.fixture(scope="module")
def user_data():
    return {
        "user_id": "d0b9dd2b-e953-4584-a750-26c4bf906390R",
        "datasource_id": "638f334e8e54760eafc64e66",
        "event": "Viewed /register Page",
    }


@pytest.fixture(scope="module")
def action_data():
    return {
        "datasourceId": "63e4da53370789982002e57d",
        "name": "clicked on settings",
        "groups": [
            {"selector": "#__next > div > div.css-3h169z > div.css-8xl60i > button"}
        ],
        "eventType": "$autocapture",
    }


@pytest.fixture(scope="module")
def transient_action_data():
    return {
        "datasourceId": "63e4da53370789982002e57d",
        "groups": [
            {"selector": "#__next > div > div.css-3h169z > div.css-8xl60i > button"}
        ],
        "eventType": "$autocapture",
    }


@pytest.fixture(scope="module")
def queried_user_property():
    return {
        "user_id": "user_id",
        "datasource_id": "datasource_id",
        "property": {
            "$insert_id": "33ba7915-444f-4b91-9541-a49334a5a72e",
            "$insert_key": "006a3255bb6bfa3e095a499cd0e0807c9a#832",
            "$schema": 13,
            "amplitude_id": 502527487487,
            "app": 281811,
            "city": "Lapu-Lapu City",
        },
    }


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
def metric_service(apperture_user_response):
    metric_service = mock.MagicMock()
    Metric.get_settings = mock.MagicMock()
    metric = Metric(
        id=PydanticObjectId("63d0df1ea1040a6388a4a34c"),
        datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
        app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
        user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
        name="Video Metric",
        function="A/B",
        aggregates=[
            {
                "variable": "A",
                "variant": "event",
                "aggregations": {"functions": "count", "property": "Video_Seen"},
                "reference_id": "Video_Seen",
                "filters": [],
                "conditions": [],
            },
            {
                "variable": "B",
                "variant": "event",
                "aggregations": {"functions": "count", "property": "Video_Open"},
                "reference_id": "Video_Open",
                "filters": [],
                "conditions": [],
            },
        ],
        breakdown=[],
    )

    metrics_future = asyncio.Future()
    metrics_future.set_result([MetricWithUser.from_orm(metric)])
    computed_metric = [
        ComputedMetricStep(
            name="A/B",
            series=[
                ComputedMetricData(
                    breakdown=[],
                    data=[
                        MetricValue(date="2022-10-07", value=4),
                        MetricValue(date="2022-10-08", value=26),
                        MetricValue(date="2022-10-09", value=11),
                        MetricValue(date="2022-10-10", value=14),
                        MetricValue(date="2022-10-11", value=22),
                        MetricValue(date="2022-10-12", value=33),
                    ],
                )
            ],
        )
    ]

    computed_metric_future = asyncio.Future()
    computed_metric_future.set_result(computed_metric)

    metric_service.compute_metric.return_value = computed_metric_future
    metric_service.get_metrics_for_datasource_id.return_value = metrics_future
    return metric_service


@pytest.fixture(scope="module")
def segment_service(apperture_user_response):
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
            operator=SegmentFilterOperatorsString.IS,
            operand="properties.$city",
            values=["Delhi", "Indore", "Bhopal"],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.WHERE,
            datatype=SegmentDataType.STRING,
        ),
        WhereSegmentFilter(
            operator=SegmentFilterOperatorsNumber.EQ,
            operand="properties.$app_release",
            values=[5003, 2077, 5002],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.AND,
            datatype=SegmentDataType.NUMBER,
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

    # segments_future = asyncio.Future()
    # segments_future.set_result([SegmentWithUser.from_orm(segment)])

    segment_service.add_segment.return_value = segment
    segment_service.update_segment.return_value = segment
    segment_service.get_segment.return_value = segment
    segment_service.get_segments_for_app.return_value = [segment]
    segment_service.get_segments_for_datasource_id.return_value = [
        SegmentWithUser.from_orm(segment)
    ]
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
    app = App(
        id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        revision_id=None,
        created_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
        updated_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
        name="mixpanel1",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        shared_with=set(),
    )
    user_future = asyncio.Future()
    app_service_mock.find_user.return_value = user_future
    app_service_mock.share_app = mock.AsyncMock()
    apps_future = asyncio.Future()
    apps_future.set_result(apps)

    app_future = asyncio.Future()
    app_future.set_result(app)

    app_service_mock.get_apps.return_value = apps_future
    app_service_mock.get_user_app.return_value = app_future
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
                        "datatype": "String",
                        "operand": "properties.$city",
                        "operator": "is",
                        "type": "where",
                        "values": ["Delhi", "Indore", "Bhopal"],
                    },
                    {
                        "all": False,
                        "condition": "and",
                        "datatype": "Number",
                        "operand": "properties.$app_release",
                        "operator": "equals",
                        "type": "where",
                        "values": [5003, 2077, 5002],
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
def saved_segment_with_user():
    return [
        {
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
                            "datatype": "String",
                            "operand": "properties.$city",
                            "operator": "is",
                            "type": "where",
                            "values": ["Delhi", "Indore", "Bhopal"],
                        },
                        {
                            "all": False,
                            "condition": "and",
                            "datatype": "Number",
                            "operand": "properties.$app_release",
                            "operator": "equals",
                            "type": "where",
                            "values": [5003, 2077, 5002],
                        },
                    ],
                }
            ],
            "name": "name",
            "revisionId": ANY,
            "updatedAt": None,
            "userId": "63771fc960527aba9354399c",
            "user": {
                "firstName": "Test",
                "lastName": "User",
                "email": "test@email.com",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
            },
        }
    ]


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
                "filters": None,
            },
            {"event": "Chapter_Click", "filters": None},
            {
                "event": "Topic_Click",
                "filters": None,
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
        "revisionId": ANY,
        "createdAt": ANY,
        "updatedAt": None,
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "appId": "635ba034807ab86d8a2aadd9",
        "userId": "635ba034807ab86d8a2aadda",
        "name": "name",
        "notificationType": [NotificationType.UPDATE],
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
        "variant": NotificationVariant.NODE,
        "reference": "/p/partner/job",
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
                "variant": NotificationVariant.NODE,
                "reference": "/p/partner/job",
            },
        }
    ]


@pytest.fixture(scope="module")
def funnel_steps_data():
    steps = [
        {
            "event": "Login",
            "filters": [{"property": "mp_country_code", "value": "IN"}],
        },
        {"event": "Chapter_Click"},
        {
            "event": "Topic_Click",
            "filters": [{"property": "os", "value": "Android"}],
        },
    ]
    datasource_id = "638f1aac8e54760eafc64d70"
    return {
        "datasource_id": datasource_id,
        "steps": steps,
    }


@pytest.fixture(scope="module")
def funnel_user_conversion_response():
    return {
        "users": [{"id": "user_1"}, {"id": "user_2"}],
        "totalUsers": 2,
        "uniqueUsers": 2,
    }


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
                "filters": None,
            },
            {
                "event": "Chapter_Click",
                "filters": None,
            },
            {
                "event": "Topic_Click",
                "filters": None,
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
    return [
        {
            "name": "A/B",
            "series": [
                {
                    "breakdown": [],
                    "data": [
                        {"date": "2022-10-07", "value": 4.0},
                        {"date": "2022-10-08", "value": 26.0},
                        {"date": "2022-10-09", "value": 11.0},
                        {"date": "2022-10-10", "value": 14.0},
                        {"date": "2022-10-11", "value": 22.0},
                        {"date": "2022-10-12", "value": 33.0},
                    ],
                }
            ],
        }
    ]


@pytest.fixture(scope="module")
def notification_data():
    return {
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "name": "name",
        "notificationType": [NotificationType.UPDATE],
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
        "variant": NotificationVariant.NODE,
        "reference": "/p/partner/job",
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
                "filters": None,
            },
            {
                "event": "Chapter_Click",
                "filters": None,
            },
            {
                "event": "Topic_Click",
                "filters": None,
            },
        ],
        "randomSequence": False,
    }


@pytest.fixture(scope="module")
def funnel_conversion_request():
    return {
        "datasourceId": "636a1c61d715ca6baae65611",
        "status": "converted",
        "steps": [
            {
                "event": "Login",
                "filters": None,
            },
            {
                "event": "Chapter_Click",
                "filters": None,
            },
            {
                "event": "Topic_Click",
                "filters": None,
            },
        ],
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
                        "operator": "is",
                        "values": ["Delhi", "Indore", "Bhopal"],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.WHERE,
                        "all": False,
                        "datatype": "String",
                    },
                    {
                        "operand": "properties.$app_release",
                        "operator": "equals",
                        "values": [5003, 2077, 5002],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.AND,
                        "all": False,
                        "datatype": "Number",
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
                        "operator": SegmentFilterOperatorsString.IS,
                        "values": ["Delhi", "Indore", "Bhopal"],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.WHERE,
                        "all": False,
                        "datatype": "String",
                    },
                    {
                        "operand": "properties.$app_release",
                        "operator": SegmentFilterOperatorsNumber.EQ,
                        "values": [5003, 2077, 5002],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.AND,
                        "all": False,
                        "datatype": "Number",
                    },
                ],
                "condition": "and",
            }
        ],
        "columns": ["properties.$app_release", "properties.$city"],
    }


@pytest.fixture(scope="module")
def mock_find_email_user():
    AppertureUser.get_settings = mock.MagicMock()
    user = AppertureUser(
        first_name="mock",
        last_name="mock",
        email="test@email.com",
        picture="",
    )
    future = asyncio.Future()
    future.set_result(user)
    return future


@pytest.fixture(scope="module")
def integration_service():
    integration_service_mock = mock.MagicMock()
    Integration.get_settings = mock.MagicMock()
    integration = Integration(
        app_id="636a1c61d715ca6baae65611",
        user_id="636a1c61d715ca6baae65611",
        provider=IntegrationProvider.MIXPANEL,
        credential=Credential(
            type=CredentialType.API_KEY,
            api_key="apperture_911",
            account_id="120232",
            secret="6ddqwjeaa",
        ),
    )

    integration_future = asyncio.Future()
    integration_future.set_result(integration)
    integration_service_mock.create_integration.return_value = integration_future
    return integration_service_mock


@pytest.fixture(scope="module")
def integration_data():
    return {
        "appId": "636a1c61d715ca6baae65611",
        "accountId": "120232",
        "apiKey": "apperture_911",
        "apiSecret": "6ddqwjeaa",
        "provider": IntegrationProvider.MIXPANEL,
    }


@pytest.fixture(scope="module")
def integration_response():
    return {
        "_id": None,
        "appId": "636a1c61d715ca6baae65611",
        "createdAt": ANY,
        "credential": {
            "account_id": "120232",
            "api_key": "apperture_911",
            "refresh_token": None,
            "secret": "6ddqwjeaa",
            "type": "API_KEY",
        },
        "datasource": {
            "_id": "636a1c61d715ca6baae65611",
            "appId": "636a1c61d715ca6baae65611",
            "createdAt": ANY,
            "enabled": True,
            "externalSourceId": "123",
            "integrationId": "636a1c61d715ca6baae65611",
            "name": None,
            "provider": "mixpanel",
            "revisionId": ANY,
            "updatedAt": None,
            "userId": "636a1c61d715ca6baae65611",
            "version": "DEFAULT",
        },
        "provider": "mixpanel",
        "revisionId": ANY,
        "updatedAt": None,
        "userId": "636a1c61d715ca6baae65611",
    }


@pytest.fixture(scope="module")
def runlog_service():
    runlog_service_mock = mock.MagicMock()
    RunLog.get_settings = mock.MagicMock()
    runlog_service_mock.create_runlogs = mock.AsyncMock()
    return runlog_service_mock


@pytest.fixture(scope="module")
def dpq_service():
    dpq_service_mock = mock.MagicMock()
    dpq_service_mock.enqueue_from_runlogs = mock.MagicMock(return_value=["test"])
    return dpq_service_mock
