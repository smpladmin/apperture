from datetime import datetime
from unittest import mock
from unittest.mock import MagicMock, AsyncMock, ANY
from beanie import PydanticObjectId
import asyncio

import pytest
from pypika import ClickHouseQuery, Table
from domain.notifications.models import (
    Notification,
    ThresholdMap,
    NotificationData,
    NotificationVariant,
)
from domain.common.date_models import LastDateFilter, DateFilter, DateFilterType
from domain.common.filter_models import (
    FilterOperatorsNumber,
    FilterDataType,
    LogicalOperators,
)
from domain.metrics.models import (
    Metric,
    SegmentsAndEvents,
    SegmentsAndEventsType,
    SegmentsAndEventsAggregations,
    ComputedMetricStep,
    ComputedMetricData,
    MetricValue,
    MetricBreakdown,
    MetricBasicAggregation,
    SegmentFilter,
    SelectedSegments,
)
from domain.metrics.service import MetricService
from domain.segments.models import (
    SegmentGroup,
    WhereSegmentFilter,
    SegmentFilterConditions,
)


class TestMetricService:
    def setup_method(self):
        Metric.get_settings = MagicMock()
        Notification.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.metric = MagicMock()
        self.segment = MagicMock()
        self.date_utils = MagicMock()
        self.service = MetricService(
            mongo=self.mongo,
            metric=self.metric,
            segment=self.segment,
            date_utils=self.date_utils,
        )
        self.ds_id = "636a1c61d715ca6baae65611"
        self.date_filter = DateFilter(
            filter=LastDateFilter(days=3), type=DateFilterType.LAST
        )
        self.id = "6384a65e0a397236d9de236a"
        Metric.id = MagicMock(return_value=self.id)
        Metric.enabled = True
        self.metric_future = asyncio.Future()
        self.metric_future.set_result(
            Metric(
                id=PydanticObjectId("63dcfe6a21a93919c672d5bb"),
                revision_id=None,
                created_at=datetime(2023, 2, 3, 12, 30, 34, 757000),
                updated_at=datetime(2023, 4, 3, 12, 56, 1, 71000),
                datasource_id=PydanticObjectId("63d0a7bfc636cee15d81f579"),
                app_id=PydanticObjectId("63ca46feee94e38b81cda37a"),
                user_id=PydanticObjectId("6374b74e9b36ecf7e0b4f9e4"),
                name="Alert Metric -Updated",
                function="A*2",
                aggregates=[
                    SegmentsAndEvents(
                        variable="A",
                        variant=SegmentsAndEventsType.EVENT,
                        aggregations=SegmentsAndEventsAggregations(
                            functions=MetricBasicAggregation.COUNT,
                            property="Video_Open",
                        ),
                        reference_id="Video_Open",
                        filters=[],
                    ),
                    SegmentsAndEvents(
                        variable="B",
                        variant=SegmentsAndEventsType.EVENT,
                        aggregations=SegmentsAndEventsAggregations(
                            functions=MetricBasicAggregation.COUNT, property=""
                        ),
                        reference_id="WebView_Open",
                        filters=[],
                    ),
                ],
                breakdown=[],
                date_filter=DateFilter(filter=None, type=None),
                segment_filter=[
                    SegmentFilter(
                        condition="and",
                        includes=True,
                        custom=SegmentGroup(
                            filters=[],
                            condition=LogicalOperators.AND,
                        ),
                        segments=[
                            SelectedSegments(
                                id="48392000212",
                                name="Segment1",
                                groups=[
                                    SegmentGroup(
                                        filters=[
                                            WhereSegmentFilter(
                                                operand="test",
                                                operator=FilterOperatorsNumber.EQ,
                                                values=["1"],
                                                condition=SegmentFilterConditions.WHERE,
                                                datatype=FilterDataType.NUMBER,
                                            )
                                        ],
                                        condition=LogicalOperators.AND,
                                    )
                                ],
                            )
                        ],
                    )
                ],
                enabled=True,
            )
        )
        self.metric_future.update = AsyncMock()
        self.update_mock = self.metric_future.update
        Metric.find_one = MagicMock(return_value=self.metric_future)

        self.date_utils.compute_date_filter.return_value = ("2023-01-22", "2023-01-24")
        self.aggregates = [
            SegmentsAndEvents(
                variable="A",
                variant=SegmentsAndEventsType.EVENT,
                aggregations=SegmentsAndEventsAggregations(
                    functions=MetricBasicAggregation.COUNT,
                    property="Video_Seen",
                ),
                reference_id="Video_Seen",
                filters=[],
                conditions=[],
            ),
            SegmentsAndEvents(
                variable="B",
                variant=SegmentsAndEventsType.EVENT,
                aggregations=SegmentsAndEventsAggregations(
                    functions=MetricBasicAggregation.COUNT,
                    property="Video_Open",
                ),
                reference_id="Video_Open",
                filters=[],
                conditions=[],
            ),
        ]
        self.metric_notifications = [
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
                variant="metric",
                reference="63dcfe6a21a93919c672d5bb",
                enabled=True,
            )
        ]

    @pytest.mark.parametrize(
        "query_result, function, breakdown, result",
        [
            (
                [
                    (datetime(2023, 1, 22).date(), 518),
                    (datetime(2023, 1, 23).date(), 418),
                    (datetime(2023, 1, 24).date(), 318),
                ],
                "A",
                [],
                [
                    ComputedMetricStep(
                        name="A",
                        series=[
                            ComputedMetricData(
                                breakdown=[],
                                data=[
                                    MetricValue(date="2023-01-22", value=518.0),
                                    MetricValue(date="2023-01-23", value=418.0),
                                    MetricValue(date="2023-01-24", value=318.0),
                                ],
                            )
                        ],
                    )
                ],
            ),
            (
                [
                    (datetime(2023, 1, 22).date(), "1.5.9", 327, 518),
                    (datetime(2023, 1, 23).date(), "1.5.13", 227, 318),
                    (datetime(2023, 1, 24).date(), "1.5.16", 127, 418),
                ],
                "A,B",
                ["property1"],
                [
                    ComputedMetricStep(
                        name="A",
                        series=[
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(property="property1", value="1.5.9")
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=327.0),
                                    MetricValue(date="2023-01-23", value=0.0),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.13"
                                    )
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=0.0),
                                    MetricValue(date="2023-01-23", value=227.0),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.16"
                                    )
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=0.0),
                                    MetricValue(date="2023-01-23", value=0.0),
                                    MetricValue(date="2023-01-24", value=127.0),
                                ],
                            ),
                        ],
                    ),
                    ComputedMetricStep(
                        name="B",
                        series=[
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(property="property1", value="1.5.9")
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=518.0),
                                    MetricValue(date="2023-01-23", value=0.0),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.13"
                                    )
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=0.0),
                                    MetricValue(date="2023-01-23", value=318.0),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.16"
                                    )
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=0.0),
                                    MetricValue(date="2023-01-23", value=0.0),
                                    MetricValue(date="2023-01-24", value=418.0),
                                ],
                            ),
                        ],
                    ),
                ],
            ),
            (
                [
                    (datetime(2023, 1, 22).date(), "1.5.9", "5009", 1.1),
                    (datetime(2023, 1, 22).date(), "1.5.8", "5009", 1.4),
                    (datetime(2023, 1, 22).date(), "1.5.8", "5007", 1.9),
                    (datetime(2023, 1, 22).date(), "1.5.9", "5007", 0.9),
                    (datetime(2023, 1, 23).date(), "1.5.9", "5009", 1.1),
                    (datetime(2023, 1, 23).date(), "1.5.8", "5009", 1.4),
                    (datetime(2023, 1, 23).date(), "1.5.8", "5007", 1.9),
                    (datetime(2023, 1, 23).date(), "1.5.9", "5007", 0.9),
                ],
                "A/B",
                ["property1", "property2"],
                [
                    ComputedMetricStep(
                        name="A/B",
                        series=[
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.9"
                                    ),
                                    MetricBreakdown(property="property2", value="5009"),
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=1.1),
                                    MetricValue(date="2023-01-23", value=1.1),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.8"
                                    ),
                                    MetricBreakdown(property="property2", value="5009"),
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=1.4),
                                    MetricValue(date="2023-01-23", value=1.4),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.8"
                                    ),
                                    MetricBreakdown(property="property2", value="5007"),
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=1.9),
                                    MetricValue(date="2023-01-23", value=1.9),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.9"
                                    ),
                                    MetricBreakdown(property="property2", value="5007"),
                                ],
                                data=[
                                    MetricValue(date="2023-01-22", value=0.9),
                                    MetricValue(date="2023-01-23", value=0.9),
                                    MetricValue(date="2023-01-24", value=0.0),
                                ],
                            ),
                        ],
                    )
                ],
            ),
        ],
    )
    @pytest.mark.asyncio
    async def test_compute_metric(self, query_result, function, breakdown, result):
        self.metric.compute_query.return_value = query_result
        assert (
            await self.service.compute_metric(
                datasource_id=self.ds_id,
                aggregates=self.aggregates,
                function=function,
                breakdown=breakdown,
                date_filter=self.date_filter,
                segment_filter=None,
            )
            == result
        )

    @pytest.mark.asyncio
    async def test_compute_metric_with_segment_filter(self):
        self.metric.compute_query.return_value = [
            (datetime(2023, 1, 22).date(), 518),
            (datetime(2023, 1, 23).date(), 418),
            (datetime(2023, 1, 24).date(), 318),
        ]

        self.segment.build_segment_filter_on_metric_criterion = MagicMock(
            return_value=(
                Table("test")
                .user_id.isin(ClickHouseQuery.from_(Table("test")).select("*"))
                .__str__()
            )
        )
        segment_filter = [
            SegmentFilter(
                condition="and",
                includes=True,
                custom=SegmentGroup(
                    filters=[],
                    condition=LogicalOperators.AND,
                ),
                segments=[
                    SelectedSegments(
                        id="48392000212",
                        name="Segment1",
                        groups=[
                            SegmentGroup(
                                filters=[
                                    WhereSegmentFilter(
                                        operand="test",
                                        operator=FilterOperatorsNumber.EQ,
                                        values=["1"],
                                        condition=SegmentFilterConditions.WHERE,
                                        datatype=FilterDataType.NUMBER,
                                    )
                                ],
                                condition=LogicalOperators.AND,
                            )
                        ],
                    )
                ],
            )
        ]

        assert await self.service.compute_metric(
            datasource_id=self.ds_id,
            aggregates=self.aggregates,
            function="A",
            breakdown=[],
            date_filter=self.date_filter,
            segment_filter=segment_filter,
        ) == [
            ComputedMetricStep(
                name="A",
                series=[
                    ComputedMetricData(
                        breakdown=[],
                        data=[
                            MetricValue(date="2023-01-22", value=518.0),
                            MetricValue(date="2023-01-23", value=418.0),
                            MetricValue(date="2023-01-24", value=318.0),
                        ],
                    )
                ],
            )
        ]
        self.segment.build_segment_filter_on_metric_criterion.assert_called_once_with(
            **{
                "segment_filter": [
                    SegmentFilter(
                        condition="and",
                        includes=True,
                        custom=SegmentGroup(
                            filters=[],
                            condition=LogicalOperators.AND,
                        ),
                        segments=[
                            SelectedSegments(
                                id="48392000212",
                                name="Segment1",
                                groups=[
                                    SegmentGroup(
                                        filters=[
                                            WhereSegmentFilter(
                                                operand="test",
                                                operator=FilterOperatorsNumber.EQ,
                                                values=["1"],
                                                condition=SegmentFilterConditions.WHERE,
                                                datatype=FilterDataType.NUMBER,
                                            )
                                        ],
                                        condition=LogicalOperators.AND,
                                    )
                                ],
                            )
                        ],
                    )
                ]
            }
        )
        self.metric.compute_query.assert_called_once_with(
            **{
                "aggregates": [
                    SegmentsAndEvents(
                        variable="A",
                        variant=SegmentsAndEventsType.EVENT,
                        aggregations=SegmentsAndEventsAggregations(
                            functions=MetricBasicAggregation.COUNT,
                            property="Video_Seen",
                        ),
                        reference_id="Video_Seen",
                        filters=[],
                    ),
                    SegmentsAndEvents(
                        variable="B",
                        variant=SegmentsAndEventsType.EVENT,
                        aggregations=SegmentsAndEventsAggregations(
                            functions=MetricBasicAggregation.COUNT,
                            property="Video_Open",
                        ),
                        reference_id="Video_Open",
                        filters=[],
                    ),
                ],
                "breakdown": [],
                "datasource_id": "636a1c61d715ca6baae65611",
                "end_date": "2023-01-24",
                "function": "A",
                "segment_filter_criterion": '"user_id" IN (SELECT * FROM "test")',
                "start_date": "2023-01-22",
            }
        )

    @pytest.mark.asyncio
    async def test_delete_metric(self):
        await self.service.delete_metric(metric_id="6384a65e0a397236d9de236a")
        Metric.find_one.assert_called_once()
        self.update_mock.assert_called_once_with({"$set": {"enabled": False}})

    @pytest.mark.asyncio
    async def test_get_metric_data_for_notification(self):
        notification_data_future = asyncio.Future()
        notification_data_future.set_result(0.2)
        self.service.get_notification_data = MagicMock(
            return_value=notification_data_future
        )
        assert await self.service.get_metric_data_for_notifications(
            notifications=self.metric_notifications
        ) == [
            NotificationData(
                name="Alert Metric -Updated",
                notification_id=PydanticObjectId("6437a278a2fdd9488bef5253"),
                variant=NotificationVariant.METRIC,
                value=0.2,
                prev_day_value=0.2,
                threshold_type="absolute",
                threshold_value=ThresholdMap(min=1212.0, max=3236.0),
            )
        ]
        self.service.get_notification_data.assert_called_with(
            days_ago=2,
            notification=Notification(
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
                variant="metric",
                reference="63dcfe6a21a93919c672d5bb",
                enabled=True,
            ),
        ),

    @pytest.mark.asyncio
    async def test_get_notification_data(self):
        self.service.get_metric_by_id = MagicMock(return_value=self.metric_future)
        self.segment.build_segment_filter_on_metric_criterion = MagicMock(
            return_value='"user_id" IN (SELECT * FROM "test")'
        )

        self.metric.compute_query = MagicMock(
            return_value=[(datetime(2023, 4, 13, 6, 34, 32, 876000), 1500.0)]
        )
        assert (
            await self.service.get_notification_data(
                notification=self.metric_notifications[0], days_ago=2
            )
            == 1500.0
        )

        self.metric.compute_query.assert_called_with(
            **{
                "aggregates": [
                    SegmentsAndEvents(
                        variable="A",
                        variant=SegmentsAndEventsType.EVENT,
                        aggregations=SegmentsAndEventsAggregations(
                            functions=MetricBasicAggregation.COUNT,
                            property="Video_Open",
                        ),
                        reference_id="Video_Open",
                        filters=[],
                    ),
                    SegmentsAndEvents(
                        variable="B",
                        variant=SegmentsAndEventsType.EVENT,
                        aggregations=SegmentsAndEventsAggregations(
                            functions=MetricBasicAggregation.COUNT, property=""
                        ),
                        reference_id="WebView_Open",
                        filters=[],
                    ),
                ],
                "breakdown": [],
                "datasource_id": "63d0a7bfc636cee15d81f579",
                "end_date": ANY,
                "function": "A*2",
                "segment_filter_criterion": '"user_id" IN (SELECT * FROM "test")',
                "start_date": ANY,
            }
        )
