import asyncio
from datetime import datetime
from unittest import mock
from unittest.mock import ANY, AsyncMock

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
from domain.apps.models import App, ClickHouseCredential
from domain.clickstream_event_properties.models import ClickStreamEventProperties
from domain.common.date_models import DateFilter, DateFilterType, LastDateFilter
from domain.common.filter_models import (
    FilterDataType,
    FilterOperatorsNumber,
    FilterOperatorsString,
    LogicalOperators,
)
from domain.common.models import IntegrationProvider
from domain.datamart.models import DataMart
from domain.datasources.models import DataSource, DataSourceVersion
from domain.edge.models import Edge, NodeSankey, NodeSignificance, NodeTrend
from domain.event_properties.models import EventProperties
from domain.events.models import Event, PaginatedEventsData
from domain.files.models import File
from domain.funnels.models import (
    ComputedFunnel,
    ComputedFunnelStep,
    Funnel,
    FunnelConversionData,
    FunnelEventUserData,
    FunnelTrendsData,
)
from domain.integrations.models import (
    Credential,
    CredentialType,
    CSVCredential,
    Integration,
)
from domain.metrics.models import (
    ComputedMetricData,
    ComputedMetricStep,
    Metric,
    MetricValue,
)
from domain.notifications.models import (
    ComputedNotification,
    Notification,
    NotificationChannel,
    NotificationData,
    NotificationFrequency,
    NotificationMetric,
    NotificationThresholdType,
    NotificationType,
    NotificationVariant,
    ThresholdMap,
)
from domain.properties.models import Properties, Property, PropertyDataType
from domain.retention.models import (
    ComputedRetention,
    EventSelection,
    Granularity,
    Retention,
)
from domain.runlogs.models import RunLog
from domain.segments.models import (
    ComputedSegment,
    Segment,
    SegmentFilterConditions,
    SegmentGroup,
    WhereSegmentFilter,
)
from domain.spreadsheets.models import (
    ColumnType,
    ComputedSpreadsheet,
    ComputedSpreadsheetWithCustomHeaders,
    Spreadsheet,
    SpreadSheetColumn,
    SpreadsheetType,
    WorkBook,
)
from domain.google_sheet.models import SheetQuery, SheetReference

from domain.users.models import UserDetails
from rest.dtos.actions import ComputedActionResponse
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.datamart import DataMartWithUser
from rest.dtos.funnels import FunnelWithUser
from rest.dtos.metrics import MetricWithUser
from rest.dtos.notifications import NotificationWithUser
from rest.dtos.retention import RetentionWithUser
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
            id="635ba034807ab86d8a2aadd8",
            firstName="Test",
            lastName="User",
            email="test@email.com",
            picture="https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
            slackChannel="#alerts",
            hasVisitedSheets=False,
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

    notification_to_compute = [
        Notification(
            id=PydanticObjectId("6437a278a2fdd9488bef5253"),
            revision_id=None,
            created_at=datetime(2023, 4, 13, 6, 34, 32, 876000),
            updated_at=datetime(2023, 4, 13, 8, 16, 16, 593000),
            datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
            user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
            app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
            name="Video Funnel",
            notification_type={"alert", "update"},
            metric="hits",
            multi_node=False,
            apperture_managed=False,
            pct_threshold_active=False,
            pct_threshold_values=None,
            absolute_threshold_active=True,
            absolute_threshold_values=ThresholdMap(min=12.0, max=18.0),
            formula="a",
            variable_map={"a": ["Video Funnel"]},
            preferred_hour_gmt=5,
            frequency="daily",
            preferred_channels=["slack"],
            notification_active=True,
            variant=NotificationVariant.FUNNEL,
            reference="63dcfe6a21a93919c672d5bb",
            enabled=True,
        ),
        Notification(
            id=PydanticObjectId("6437a278a2fdd9488bef5253"),
            revision_id=None,
            created_at=datetime(2023, 4, 13, 6, 34, 32, 876000),
            updated_at=datetime(2023, 4, 13, 8, 16, 16, 593000),
            datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
            user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
            app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
            name="Alert Metric -Updated",
            notification_type={"alert", "update"},
            metric="hits",
            multi_node=False,
            apperture_managed=False,
            pct_threshold_active=False,
            pct_threshold_values=None,
            absolute_threshold_active=True,
            absolute_threshold_values=ThresholdMap(min=1212.0, max=3236.0),
            formula="a",
            variable_map={"a": ["Alert Metric -Updated"]},
            preferred_hour_gmt=5,
            frequency="daily",
            preferred_channels=["slack"],
            notification_active=True,
            variant=NotificationVariant.METRIC,
            reference="63dcfe6a21a93919c672d5bb",
            enabled=True,
        ),
    ]

    computed_alerts = [
        ComputedNotification(
            name="Video Funnel",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            notification_type=NotificationType.ALERT,
            variant=NotificationVariant.FUNNEL,
            value=-16.67,
            original_value=0.1,
            reference="639237437483490",
            threshold_type=NotificationThresholdType.PCT,
            user_threshold=ThresholdMap(min=12.0, max=18.0),
            trigger=True,
        ),
        ComputedNotification(
            name="Alert Metric -Updated",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            notification_type=NotificationType.ALERT,
            variant=NotificationVariant.METRIC,
            value=-16.67,
            original_value=0.1,
            reference="6777439823920337",
            threshold_type=NotificationThresholdType.PCT,
            user_threshold=ThresholdMap(min=1212.0, max=3236.0),
            trigger=False,
        ),
    ]

    computed_updates = [
        ComputedNotification(
            name="Video Funnel",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            notification_type=NotificationType.UPDATE,
            variant=NotificationVariant.FUNNEL,
            value=-16.67,
            original_value=0.1,
            reference="639237437483490",
            threshold_type=None,
            user_threshold=None,
            trigger=None,
        ),
        ComputedNotification(
            name="Alert Metric -Updated",
            notification_id=PydanticObjectId("633fb88bbbc29934eeb39ece"),
            notification_type=NotificationType.UPDATE,
            variant=NotificationVariant.METRIC,
            value=-16.67,
            original_value=0.1,
            reference="6777439823920337",
            threshold_type=None,
            user_threshold=None,
            trigger=None,
        ),
    ]

    notif_future = asyncio.Future()
    notif_future.set_result(notif)

    notifications_future = asyncio.Future()
    notifications_future.set_result([NotificationWithUser.from_orm(notif)])

    notification_compute_future = asyncio.Future()
    notification_compute_future.set_result(notification_to_compute)

    notification_service_mock.delete_notification = mock.AsyncMock()

    notification_service_mock.build_notification.return_value = notif
    notification_service_mock.add_notification.return_value = notif_future
    notification_service_mock.update_notification.return_value = notif_future
    notification_service_mock.get_notification_by_reference.return_value = notif_future
    notification_service_mock.get_notifications_for_datasource_id.return_value = (
        notifications_future
    )
    notification_service_mock.get_notifications_for_apps.return_value = (
        notifications_future
    )
    notification_service_mock.fetch_and_delete_notification = mock.AsyncMock()
    notification_service_mock.get_notifications_to_compute.return_value = (
        notification_compute_future
    )
    notification_service_mock.compute_alerts.return_value = computed_alerts
    notification_service_mock.compute_updates.return_value = computed_updates
    notification_service_mock.get_notifications.return_value = (
        notification_compute_future
    )

    return notification_service_mock


@pytest.fixture(scope="module")
def retention_service(apperture_user_response):
    retention_service_mock = mock.MagicMock()
    Retention.get_settings = mock.MagicMock()
    retention = Retention(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        app_id=PydanticObjectId("635ba034807ab86d8a2aadd7"),
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        name="name",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        start_event=EventSelection(event="start_event", filters=None),
        goal_event=EventSelection(event="goal_event", filters=None),
        date_filter=DateFilter(type=DateFilterType.LAST, filter=LastDateFilter(days=4)),
        segment_filter=None,
        granularity=Granularity.DAYS,
        enabled=True,
    )

    transient_retention = [
        ComputedRetention(
            granularity=datetime(2022, 11, 24, 0, 0),
            interval=1,
            interval_name="day 1",
            initial_users=202,
            retention_rate=55.94,
            retained_users=113,
        ),
        ComputedRetention(
            granularity=datetime(2022, 11, 25, 0, 0),
            interval=1,
            interval_name="day 1",
            initial_users=230,
            retention_rate=48.7,
            retained_users=112,
        ),
        ComputedRetention(
            granularity=datetime(2022, 11, 26, 0, 0),
            interval=1,
            interval_name="day 1",
            initial_users=206,
            retention_rate=52.43,
            retained_users=108,
        ),
        ComputedRetention(
            granularity=datetime(2022, 11, 27, 0, 0),
            interval=1,
            interval_name="day 1",
            initial_users=202,
            retention_rate=51.98,
            retained_users=105,
        ),
    ]
    retention_future = asyncio.Future()
    retention_future.set_result(retention)
    retentions_future = asyncio.Future()
    retentions_future.set_result([RetentionWithUser.from_orm(retention)])
    transient_retention_future = asyncio.Future()
    transient_retention_future.set_result(transient_retention)

    retention_service_mock.build_retention.return_value = retention
    retention_service_mock.add_retention.return_value = retention_future
    retention_service_mock.get_retention.return_value = retention_future
    retention_service_mock.update_retention = mock.AsyncMock()
    retention_service_mock.delete_retention = mock.AsyncMock()
    retention_service_mock.get_retentions_for_datasource_id.return_value = (
        retentions_future
    )
    retention_service_mock.get_retentions_for_apps.return_value = retentions_future
    retention_service_mock.compute_retention.return_value = transient_retention_future
    retention_service_mock.get_retentions_for_apps.return_value = retentions_future
    return retention_service_mock


@pytest.fixture(scope="module")
def datamart_service(apperture_user_response):
    datamart_service_mock = mock.MagicMock()
    DataMart.get_settings = mock.MagicMock()
    datamart = DataMart(
        id=PydanticObjectId("635ba034807ab86d8a2aadd8"),
        app_id=PydanticObjectId("635ba034807ab86d8a2aadd7"),
        datasource_id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        name="name",
        table_name="dUKQaHtqxM",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        last_refreshed=datetime(2022, 11, 24, 0, 0),
        query="select event_name, user_id from events",
        enabled=True,
    )

    query_response = ComputedSpreadsheetWithCustomHeaders(
        headers=[
            SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER),
            SpreadSheetColumn(name="user_id", type=ColumnType.QUERY_HEADER),
        ],
        data=[
            {"index": 1, "event_name": "test_event_1", "user_id": "test_user_1"},
            {"index": 2, "event_name": "test_event_2", "user_id": "test_user_2"},
            {"index": 3, "event_name": "test_event_3", "user_id": "test_user_2"},
            {"index": 4, "event_name": "test_event_4", "user_id": "test_user_3"},
            {"index": 5, "event_name": "test_event_5", "user_id": "test_user_4"},
        ],
        sql="",
    )
    datamart_future = asyncio.Future()
    datamart_future.set_result(datamart)
    datamarts_future = asyncio.Future()
    datamarts_future.set_result([DataMartWithUser.from_orm(datamart)])
    query_response_future = asyncio.Future()
    query_response_future.set_result(query_response)

    datamart_service_mock.build_datamart_table.return_value = datamart
    datamart_service_mock.create_datamart_table.return_value = datamart_future
    datamart_service_mock.get_datamart_table.return_value = datamart_future
    datamart_service_mock.update_datamart_table = mock.AsyncMock()
    datamart_service_mock.delete_datamart_table = mock.AsyncMock()
    datamart_service_mock.refresh_datamart_table = mock.AsyncMock()
    datamart_service_mock.get_all_apps_with_datamarts = mock.AsyncMock(
        return_value=["635ba034807ab86d8a2aadd8", "63ce4906f496f7b462ab7e84"]
    )
    datamart_service_mock.get_datamart_tables_for_app_id.return_value = datamarts_future
    return datamart_service_mock


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
        enabled=True,
    )
    funnel_future = asyncio.Future()
    funnel_future.set_result(funnel)

    funnels_future = asyncio.Future()
    funnels_future.set_result([FunnelWithUser.from_orm(funnel)])

    computed_transient_funnel = [
        ComputedFunnelStep(
            event="Login", users=956, conversion=100.0, conversion_wrt_previous=100.0
        ),
        ComputedFunnelStep(
            event="Chapter_Click",
            users=547,
            conversion=57.22,
            conversion_wrt_previous=57.22,
        ),
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

    funnel_notification_data_future = asyncio.Future()
    funnel_notification_data_future.set_result(
        [
            NotificationData(
                name="Video Funnel",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.FUNNEL,
                value=0.2,
                prev_day_value=0.2,
                reference="639237437483490",
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=12.0, max=18.0),
            )
        ]
    )

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
    funnel_service_mock.delete_funnel = mock.AsyncMock()
    funnel_service_mock.get_funnel_data_for_notifications.return_value = (
        funnel_notification_data_future
    )

    return funnel_service_mock


@pytest.fixture(scope="module")
def datasource_service():
    datasource_service_mock = mock.MagicMock()
    DataSource.get_settings = mock.MagicMock()
    datasource = DataSource(
        integration_id="636a1c61d715ca6baae65611",
        app_id="636a1c61d715ca6baae65611",
        user_id="636a1c61d715ca6baae65611",
        provider=IntegrationProvider.APPERTURE,
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
        datasources_future
    )
    datasource_service_mock.get_datasources_for_provider.return_value = (
        datasources_future
    )
    datasource_service_mock.create_row_policy_for_datasources_by_app = mock.AsyncMock()
    datasource_service_mock.get_datasources_for_app_id = mock.AsyncMock()
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
                selector="#__next > div > div.css-3h169z > div.css-8xl60i > button",
                event=CaptureEvent.AUTOCAPTURE,
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
    blank_action_future = asyncio.Future()
    blank_action_future.set_result([])
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
    action_service_mock.delete_action.return_value = action_future
    action_service_mock.get_action_by_name.side_effect = [
        blank_action_future,
        action_future,
    ]
    action_service_mock.update_events_for_action = mock.AsyncMock()
    action_service_mock.get_props.return_value = [
        Property(name="prop1", type="default"),
        Property(name="prop2", type="default"),
    ]
    return action_service_mock


@pytest.fixture(scope="module")
def events_service():
    events_service_mock = mock.AsyncMock()
    events_service_mock.get_values_for_property = mock.MagicMock(
        return_value=[["Philippines"], ["Hong Kong"]]
    )
    events_service_mock.get_events = mock.MagicMock(
        return_value=PaginatedEventsData(
            count=2,
            page_number=0,
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
    events_service_mock.get_unique_events.return_value = [
        ["test1"],
        ["test2"],
        ["clicked on settings"],
    ]
    return events_service_mock


@pytest.fixture(scope="module")
def apperture_user_service(mock_find_email_user):
    service = mock.AsyncMock()
    service.get_user_by_email.return_value = mock_find_email_user
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
def event_properties_service():
    event_properties_service_mock = mock.AsyncMock()
    EventProperties.get_settings = mock.MagicMock()
    event_properties = EventProperties(
        event="test-event",
        datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e94"),
        provider="mixpanel",
        properties=[
            Property(name="prop1", type="string"),
            Property(name="prop2", type="string"),
            Property(name="prop3", type="string"),
        ],
    )
    update_event_properties_future = asyncio.Future()
    update_event_properties_future.set_result(event_properties)

    event_properties_service_mock.update_event_properties.return_value = (
        update_event_properties_future
    )

    event_properties_service_mock.get_event_properties.return_value = [
        EventProperties(
            event="test",
            datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e94"),
            provider="mixpanel",
            properties=[
                Property(name="prop1", type="string"),
                Property(name="prop4", type="string"),
                Property(name="prop3", type="string"),
            ],
        ),
        EventProperties(
            event="test2",
            datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e94"),
            provider="mixpanel",
            properties=[
                Property(name="prop1", type="string"),
                Property(name="prop4", type="string"),
                Property(name="prop3", type="string"),
            ],
        ),
        EventProperties(
            event="test",
            datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e84"),
            provider="mixpanel",
            properties=[
                Property(name="prop1", type="string"),
                Property(name="prop4", type="string"),
                Property(name="prop3", type="string"),
            ],
        ),
    ]

    event_properties_service_mock.get_event_properties_for_datasource.return_value = [
        EventProperties(
            event="test1",
            datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e94"),
            provider="mixpanel",
            properties=[
                Property(name="prop1", type="string"),
                Property(name="prop2", type="string"),
                Property(name="prop3", type="string"),
            ],
        ),
        EventProperties(
            event="test2",
            datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e94"),
            provider="mixpanel",
            properties=[
                Property(name="prop4", type="string"),
                Property(name="prop5", type="string"),
                Property(name="prop6", type="string"),
            ],
        ),
    ]

    return event_properties_service_mock


@pytest.fixture(scope="module")
def transient_spreadsheet_data():
    return {
        "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)",
        "is_sql": True,
        "datasourceId": "23412414123123",
    }


@pytest.fixture(scope="module")
def transient_spreadsheet_data_with_serialize_result():
    return {
        "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)"
    }


@pytest.fixture(scope="module")
def workbook_data():
    return {
        "name": "Test Workbook",
        "spreadsheets": [
            {
                "name": "Sheet 1",
                "query": "SELECT  event_name FROM  events WHERE timestamp>=toDate(2023-02-11)",
                "is_sql": True,
                "headers": [{"name": "event_name", "type": "QUERY_HEADER"}],
                "subHeaders": [],
                "edit_mode": True,
                "meta": {"dsId": "", "selectedColumns": []},
                "sheet_type": SpreadsheetType.SIMPLE_SHEET,
                "word_replacements": [],
                "column_format": None,
            }
        ],
        "datasourceId": "23412414123123",
    }


@pytest.fixture(scope="module")
def spreadsheets_service():
    WorkBook.get_settings = mock.MagicMock()
    spreadsheets_service_mock = mock.MagicMock()
    computed_spreadsheet_with_headers = ComputedSpreadsheetWithCustomHeaders(
        headers=[SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER)],
        data=[
            {"event_name": "test_event_1"},
            {"event_name": "test_event_2"},
            {"event_name": "test_event_3"},
            {"event_name": "test_event_4"},
            {"event_name": "test_event_5"},
        ],
        sql="select * from events",
    )
    computed_spreadsheet = ComputedSpreadsheet(
        headers=["event_name"],
        data=[
            ("test_event_1",),
            ("test_event_2",),
            ("test_event_3",),
            ("test_event_4",),
            ("test_event_5",),
        ],
        sql="select * from events",
    )
    workbook = WorkBook(
        id=PydanticObjectId("63d0df1ea1040a6388a4a34c"),
        datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
        app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
        user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
        name="Test Workbook",
        spreadsheets=[
            Spreadsheet(
                name="Sheet1",
                headers=[
                    SpreadSheetColumn(name="event_name", type=ColumnType.QUERY_HEADER)
                ],
                is_sql=True,
                query="SELECT  event_name FROM  events",
                edit_mode=True,
                meta={"dsId": "", "selectedColumns": []},
                sheet_type=SpreadsheetType.SIMPLE_SHEET,
                column_format=None,
            )
        ],
        enabled=True,
    )
    workbook_future = asyncio.Future()
    workbook_future.set_result(workbook)

    spreadsheet_future = asyncio.Future()
    spreadsheet_future.set_result(computed_spreadsheet)
    workbooks_future = asyncio.Future()
    workbooks_future.set_result([workbook])
    vlookup_future = asyncio.Future()
    vlookup_future.set_result(["test1", "test2"])

    spreadsheets_service_mock.build_workbook.return_value = workbook
    spreadsheets_service_mock.get_transient_spreadsheets.return_value = (
        spreadsheet_future
    )
    spreadsheets_service_mock.get_workbooks_for_datasource_id.return_value = (
        workbooks_future
    )
    spreadsheets_service_mock.get_workbooks_for_user_id.return_value = workbooks_future
    spreadsheets_service_mock.get_workbooks_for_app.return_value = workbooks_future

    spreadsheets_service_mock.get_workbook_by_id.return_value = workbook_future
    spreadsheets_service_mock.add_workbook.return_value = workbook_future
    spreadsheets_service_mock.update_workbook.return_value = workbook_future
    spreadsheets_service_mock.delete_workbook = mock.AsyncMock()
    spreadsheets_service_mock.compute_vlookup.return_value = vlookup_future

    return spreadsheets_service_mock


@pytest.fixture(scope="module")
def sheet_query_data():
    return {
        "name": "test2",
        "chats": [],
        "query": "Select * from events LIMIT 500",
        "spreadsheetId": "1wk7863jhstoPkL",
        "sheetReference": {"sheet_name": "Sheet1", "row_index": 1, "column_index": 1},
    }


@pytest.fixture(scope="module")
def google_sheet_service(apperture_user_response):
    google_sheet_service_mock = mock.MagicMock()
    SheetQuery.get_settings = mock.MagicMock()

    google_sheet_query = SheetQuery(
        name="Sheet1 A1:F50",
        app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
        user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
        query="Select * from events LIMIT 500",
        spreadsheet_id="1wk7863jhstoPkL",
        chats=[],
        sheet_reference=SheetReference(
            sheet_name="Sheet1", row_index=1, column_index=1
        ),
        enabled=True,
    )

    google_sheet_queries_future = asyncio.Future()
    google_sheet_queries_future.set_result([google_sheet_query])

    google_sheet_query_future = asyncio.Future()
    google_sheet_query_future.set_result(google_sheet_query)

    google_sheet_service_mock.build_sheet_query.return_value = google_sheet_query
    google_sheet_service_mock.get_sheet_queries_by_spreadsheet_id.return_value = (
        google_sheet_queries_future
    )
    google_sheet_service_mock.add_sheet_query.return_value = google_sheet_query_future
    google_sheet_service_mock.update_sheet_query.return_value = (
        google_sheet_query_future
    )

    return google_sheet_service_mock


@pytest.fixture(scope="module")
def clickstream_event_properties_service():
    clickstream_event_properties_service_mock = mock.AsyncMock()
    ClickStreamEventProperties.get_settings = mock.MagicMock()
    clickstream_event_properties = ClickStreamEventProperties(
        event="$autocapture",
        properties=[
            Property(name="prop1", type="string"),
            Property(name="prop2", type="string"),
            Property(name="prop3", type="string"),
        ],
    )
    update_event_properties_future = asyncio.Future()
    update_event_properties_future.set_result(clickstream_event_properties)

    clickstream_event_properties_service_mock.update_event_properties.return_value = (
        update_event_properties_future
    )

    clickstream_event_properties_service_mock.get_event_properties.return_value = [
        ClickStreamEventProperties(
            event="$autocapture",
            properties=[
                Property(name="prop1", type="string"),
                Property(name="prop4", type="string"),
                Property(name="prop3", type="string"),
            ],
        ),
        ClickStreamEventProperties(
            event="$pageview",
            properties=[
                Property(name="prop1", type="string"),
                Property(name="prop4", type="string"),
                Property(name="prop3", type="string"),
            ],
        ),
    ]

    return clickstream_event_properties_service_mock


@pytest.fixture(scope="module")
def files_service():
    files_service_mock = mock.MagicMock()
    File.get_settings = mock.MagicMock()
    files_service_mock.build_s3_key.return_value = (
        "/csv/636a1c61d715ca6baae65611/test.csv"
    )
    file_future = asyncio.Future()
    file_future.set_result(
        File(
            filename="test.csv",
            filetype="csv",
            app_id="636a1c61d715ca6baae65611",
            s3_key="/csv/636a1c61d715ca6baae65611/test.csv",
            table_name="test",
            enabled=True,
        )
    )
    csv_credential_future = asyncio.Future()
    csv_credential_future.set_result(
        CSVCredential(
            name="test.csv",
            s3_key="/csv/636a1c61d715ca6baae65611/test.csv",
            table_name="test",
        )
    )
    files_service_mock.add_file.return_value = file_future
    files_service_mock.get_file.return_value = file_future
    files_service_mock.get_csv_credential.return_value = csv_credential_future

    return files_service_mock


@pytest.fixture(scope="module")
def user_data():
    return {
        "user_id": "d0b9dd2b-e953-4584-a750-26c4bf906390R",
        "datasource_id": "638f334e8e54760eafc64e66",
        "event": "Viewed /register Page",
    }


@pytest.fixture(scope="module")
def dropped_user_data():
    return {
        "user_id": "d0b9dd2b-e953-4584-a750-26c4bf906390R",
        "datasource_id": "638f334e8e54760eafc64e66",
        "event": "",
    }


@pytest.fixture(scope="module")
def action_data():
    return {
        "datasourceId": "63e4da53370789982002e57d",
        "name": "clicked on settings",
        "groups": [
            {
                "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > button",
                "event": "$autocapture",
            }
        ],
    }


@pytest.fixture(scope="module")
def transient_action_data():
    return {
        "datasourceId": "63e4da53370789982002e57d",
        "groups": [
            {
                "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > button",
                "event": "$autocapture",
            }
        ],
        "dateFilter": {"filter": {"days": 7}, "type": "last"},
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
    properties_service.refresh_properties_for_all_datasources.return_value = properties
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
        enabled=True,
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

    metric_notification_data_future = asyncio.Future()
    metric_notification_data_future.set_result(
        [
            NotificationData(
                name="Alert Metric -Updated",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.METRIC,
                value=0.2,
                prev_day_value=0.2,
                reference="6777439823920337",
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=1212.0, max=3236.0),
            )
        ]
    )

    metric_service.build_metric = mock.AsyncMock()
    metric_service.build_metric.return_value = metric
    metric_service.update_metric = mock.AsyncMock()
    metric_service.compute_metric.return_value = computed_metric_future
    metric_service.get_metrics_for_datasource_id.return_value = metrics_future
    metric_service.get_metrics_by_app_id.return_value = metrics_future
    metric_service.validate_formula.return_value = True
    metric_service.delete_metric = mock.AsyncMock()
    metric_service.get_metric_data_for_notifications.return_value = (
        metric_notification_data_future
    )
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
            operator=FilterOperatorsString.IS,
            operand="properties.$city",
            values=["Delhi", "Indore", "Bhopal"],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.WHERE,
            datatype=FilterDataType.STRING,
        ),
        WhereSegmentFilter(
            operator=FilterOperatorsNumber.EQ,
            operand="properties.$app_release",
            values=[5003, 2077, 5002],
            all=False,
            type=SegmentFilterConditions.WHERE,
            condition=SegmentFilterConditions.AND,
            datatype=FilterDataType.NUMBER,
        ),
    ]
    groups = [SegmentGroup(filters=filters, condition=LogicalOperators.AND)]
    columns = ["properties.$app_release", "properties.$city"]
    segment = Segment(
        name="name",
        description="test",
        datasource_id="63771fc960527aba9354399c",
        user_id="63771fc960527aba9354399c",
        app_id="63771fc960527aba9354399c",
        groups=groups,
        columns=columns,
        enabled=True,
    )
    segment_service.compute_segment.return_value = computed_segment
    segment_service.build_segment.return_value = segment
    segment_future = asyncio.Future()
    segment_future.set_result(segment)

    segment_service.add_segment.return_value = segment
    segment_service.update_segment.return_value = segment
    segment_service.get_segment.return_value = segment
    segment_service.get_segments_for_app.return_value = [segment]
    segment_service.get_segments_for_datasource_id.return_value = [
        SegmentWithUser.from_orm(segment)
    ]
    segment_service.get_segments_for_app.return_value = [
        SegmentWithUser.from_orm(segment)
    ]
    segment_service.delete_segment = mock.AsyncMock()
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
            clickhouse_credential=None,
        ),
    ]
    app = App(
        id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        revision_id=None,
        created_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
        updated_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
        name="mixpanel1",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        shared_with=set(),
        clickhouse_credential=None,
    )
    clickhouse_credential = ClickHouseCredential(
        username="test_username", password="test_password", databasename="test_database"
    )
    app_with_credentials = App(
        id=PydanticObjectId("635ba034807ab86d8a2aadd9"),
        revision_id=None,
        created_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
        updated_at=datetime(2022, 11, 8, 7, 57, 35, 691000),
        name="mixpanel1",
        user_id=PydanticObjectId("635ba034807ab86d8a2aadda"),
        shared_with=set(),
        clickhouse_credential=clickhouse_credential,
    )
    user_future = asyncio.Future()
    app_service_mock.find_user.return_value = user_future
    app_service_mock.share_app = mock.AsyncMock()
    app_credentials_future = asyncio.Future()
    app_credentials_future.set_result(clickhouse_credential)
    apps_future = asyncio.Future()
    apps_future.set_result(apps)

    app_future = asyncio.Future()
    app_future.set_result(app)

    clickhouse_credential_future = asyncio.Future()
    clickhouse_credential_future.set_result(clickhouse_credential)

    app_with_credentials_future = asyncio.Future()
    app_with_credentials_future.set_result(app_with_credentials)

    app_service_mock.get_apps.return_value = apps_future
    app_service_mock.get_user_app.return_value = app_future
    app_service_mock.get_shared_or_owned_app.return_value = app_future
    app_service_mock.get_app = AsyncMock(return_value=app_with_credentials)
    app_service_mock.get_app_for_user.return_value = app_with_credentials_future
    app_service_mock.create_clickhouse_user.return_value = clickhouse_credential_future
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
        "enabled": True,
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
            "enabled": True,
            "user": {
                "id": "635ba034807ab86d8a2aadd8",
                "firstName": "Test",
                "lastName": "User",
                "email": "test@email.com",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
                "hasVisitedSheets": False,
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
        {
            "event": "Login",
            "users": 956,
            "conversion": 100.0,
            "conversionWrtPrevious": 100.0,
        },
        {
            "event": "Chapter_Click",
            "users": 547,
            "conversion": 57.22,
            "conversionWrtPrevious": 57.22,
        },
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
        "enabled": True,
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
def event_properties_data():
    return {
        "datasource_id": "63ce4906f496f7b462ab7e94",
        "event": "test-event",
        "properties": ["prop1", "prop4", "prop3"],
        "provider": "mixpanel",
    }


@pytest.fixture(scope="module")
def clickstream_event_properties_data():
    return {
        "event": "$autocapture",
        "properties": ["prop1", "prop4", "prop3"],
    }


@pytest.fixture(scope="module")
def funnel_user_conversion_response():
    return {
        "users": [{"id": "user_1"}, {"id": "user_2"}],
        "totalUsers": 2,
        "uniqueUsers": 2,
    }


@pytest.fixture(scope="module")
def retention_response():
    return {
        "_id": "635ba034807ab86d8a2aadd8",
        "createdAt": "2023-04-13T10:10:36.869000",
        "updatedAt": "2023-04-13T10:11:10.266000",
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "appId": "635ba034807ab86d8a2aadd7",
        "userId": "635ba034807ab86d8a2aadda",
        "name": "name",
        "startEvent": {"event": "start_event", "filters": None},
        "goalEvent": {"event": "goal_event", "filters": None},
        "dateFilter": {"filter": {"days": 4}, "type": "last"},
        "segmentFilter": None,
        "granularity": "days",
        "enabled": True,
    }


@pytest.fixture(scope="module")
def datamart_response():
    return {
        "_id": "635ba034807ab86d8a2aadd8",
        "createdAt": "2023-04-13T10:10:36.869000",
        "updatedAt": "2023-04-13T10:11:10.266000",
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "appId": "635ba034807ab86d8a2aadd7",
        "userId": "635ba034807ab86d8a2aadda",
        "name": "name",
        "tableName": "dUKQaHtqxM",
        "lastRefreshed": "2022-11-24T00:00:00",
        "query": "select event_name, user_id from events",
        "enabled": True,
    }


@pytest.fixture(scope="module")
def transient_datamart_response():
    return {
        "data": [
            {"event_name": "test_event_1"},
            {"event_name": "test_event_2"},
            {"event_name": "test_event_3"},
            {"event_name": "test_event_4"},
            {"event_name": "test_event_5"},
        ],
        "headers": [{"name": "event_name", "type": "QUERY_HEADER"}],
        "sql": "select * from events",
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
        "dateFilter": None,
        "enabled": True,
        "conversionWindow": None,
        "segmentFilter": None,
    }


@pytest.fixture(scope="module")
def transient_retention_response():
    return [
        {
            "granularity": "2022-11-24T00:00:00",
            "initialUsers": 202,
            "interval": 1,
            "intervalName": "day 1",
            "retainedUsers": 113,
            "retentionRate": 55.94,
        },
        {
            "granularity": "2022-11-25T00:00:00",
            "initialUsers": 230,
            "interval": 1,
            "intervalName": "day 1",
            "retainedUsers": 112,
            "retentionRate": 48.7,
        },
        {
            "granularity": "2022-11-26T00:00:00",
            "initialUsers": 206,
            "interval": 1,
            "intervalName": "day 1",
            "retainedUsers": 108,
            "retentionRate": 52.43,
        },
        {
            "granularity": "2022-11-27T00:00:00",
            "initialUsers": 202,
            "interval": 1,
            "intervalName": "day 1",
            "retainedUsers": 105,
            "retentionRate": 51.98,
        },
    ]


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
def metric_data():
    return {
        "datasourceId": "636a1c61d715ca6baae65611",
        "name": "Video Metric",
        "function": "A/B",
        "breakdown": [],
        "aggregates": [
            {
                "aggregations": {"functions": "count", "property": "Video_Seen"},
                "conditions": [],
                "filters": [],
                "reference_id": "Video_Seen",
                "variable": "A",
                "variant": "event",
            },
            {
                "aggregations": {"functions": "count", "property": "Video_Open"},
                "conditions": [],
                "filters": [],
                "reference_id": "Video_Open",
                "variable": "B",
                "variant": "event",
            },
        ],
    }


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
        "segmentFilter": None,
    }


@pytest.fixture(scope="module")
def retention_data():
    return {
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "startEvent": {"event": "start_event"},
        "goalEvent": {"event": "goal_event"},
        "dateFilter": {"type": "last", "filter": {"days": 4}},
        "granularity": "days",
        "name": "test",
    }


@pytest.fixture(scope="module")
def datamart_data():
    return {
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "name": "test-table",
        "query": "select event_name, user_id from events",
    }


@pytest.fixture(scope="module")
def datamart_transient_data():
    return {
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "is_sql": True,
        "query": "select event_name, user_id from events",
    }


@pytest.fixture(scope="module")
def retention_transient_data():
    return {
        "datasourceId": "635ba034807ab86d8a2aadd9",
        "startEvent": {"event": "start_event"},
        "goalEvent": {"event": "goal_event"},
        "dateFilter": {"type": "last", "filter": {"days": 4}},
        "granularity": "days",
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
                "function": "A",
                "variant": "event",
                "filters": [
                    {
                        "operator": "is",
                        "operand": "properties.$city",
                        "values": ["Bengaluru"],
                        "condition": "where",
                        "datatype": "String",
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
                        "operator": FilterOperatorsString.IS,
                        "values": ["Delhi", "Indore", "Bhopal"],
                        "type": SegmentFilterConditions.WHERE,
                        "condition": SegmentFilterConditions.WHERE,
                        "all": False,
                        "datatype": "String",
                    },
                    {
                        "operand": "properties.$app_release",
                        "operator": FilterOperatorsNumber.EQ,
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
            tableName="",
        ),
    )

    integration_future = asyncio.Future()
    integration_future.set_result(integration)
    integration_service_mock.create_integration.return_value = integration_future
    integration_service_mock.test_database_connection.return_value = True
    integration_service_mock.upload_csv_to_s3.return_value = None
    integration_service_mock.create_clickhouse_table_from_csv.return_value = True
    return integration_service_mock


@pytest.fixture(scope="module")
def integration_data():
    return {
        "appId": "636a1c61d715ca6baae65611",
        "accountId": "120232",
        "apiKey": "apperture_911",
        "apiSecret": "6ddqwjeaa",
        "provider": IntegrationProvider.MIXPANEL,
        "tableName": "",
    }


@pytest.fixture(scope="module")
def database_integration_data():
    return {
        "appId": "636a1c61d715ca6baae65611",
        "accountId": None,
        "apiKey": None,
        "apiSecret": None,
        "provider": IntegrationProvider.MYSQL,
        "databaseCredential": {
            "host": "127.0.0.1",
            "port": "3306",
            "username": "test-user",
            "password": "password",
            "databases": ["test-db"],
            "sshCredential": None,
        },
    }


@pytest.fixture(scope="module")
def csv_integration_data():
    return {
        "appId": "636a1c61d715ca6baae65611",
        "accountId": None,
        "apiKey": None,
        "apiSecret": None,
        "provider": IntegrationProvider.MYSQL,
        "databaseCredential": None,
        "csvFileId": "636a1c61d715ca6baae65615",
    }


@pytest.fixture(scope="module")
def database_credential_data():
    return {
        "host": "127.0.0.1",
        "port": "3306",
        "username": "test-user",
        "password": "password",
        "databases": ["test-db"],
        "sshCredential": None,
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
            "tableName": "",
            "type": "API_KEY",
            "mysql_credential": None,
            "mssql_credential": None,
            "cdc_credential": None,
            "csv_credential": None,
            "api_base_url": None,
            "branch_credential": None,
            "facebook_ads_credential": None,
        },
        "datasource": {
            "_id": "636a1c61d715ca6baae65611",
            "appId": "636a1c61d715ca6baae65611",
            "createdAt": ANY,
            "enabled": True,
            "externalSourceId": "123",
            "integrationId": "636a1c61d715ca6baae65611",
            "name": None,
            "provider": "apperture",
            "revisionId": ANY,
            "updatedAt": None,
            "userId": "636a1c61d715ca6baae65611",
            "version": "DEFAULT",
        },
        "provider": "mixpanel",
        "revisionId": ANY,
        "updatedAt": None,
        "userId": "636a1c61d715ca6baae65611",
        "enabled": None,
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
    dpq_service_mock.enqueue_user_notification = mock.MagicMock(
        return_value="a98a10b4-d26e-46fa-aa6f"
    )
    dpq_service_mock.enqueue_refresh_datamart_for_app = mock.MagicMock(
        return_value="a98a10b4-d26e-46fa-aa6g"
    )
    return dpq_service_mock
