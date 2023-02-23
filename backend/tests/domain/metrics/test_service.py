from datetime import datetime
from unittest.mock import MagicMock

import pytest

from domain.metrics.models import (
    Metric,
    SegmentsAndEvents,
    SegmentsAndEventsType,
    SegmentsAndEventsAggregations,
    SegmentsAndEventsAggregationsFunctions,
    ComputedMetricStep,
    ComputedMetricData,
    MetricValue,
    MetricBreakdown,
)
from domain.metrics.service import MetricService


class TestMetricService:
    def setup_method(self):
        Metric.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.metric = MagicMock()
        self.service = MetricService(mongo=self.mongo, metric=self.metric)
        self.ds_id = "636a1c61d715ca6baae65611"
        self.aggregates = [
            SegmentsAndEvents(
                variable="A",
                variant=SegmentsAndEventsType.EVENT,
                aggregations=SegmentsAndEventsAggregations(
                    functions=SegmentsAndEventsAggregationsFunctions.COUNT,
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
                    functions=SegmentsAndEventsAggregationsFunctions.COUNT,
                    property="Video_Open",
                ),
                reference_id="Video_Open",
                filters=[],
                conditions=[],
            ),
        ]

    @pytest.mark.parametrize(
        "query_result, function, breakdown, result",
        [
            (
                [
                    (datetime(2023, 1, 22), 518),
                    (datetime(2023, 1, 23), 418),
                    (datetime(2023, 1, 24), 318),
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
                    (datetime(2023, 1, 22), "1.5.9", 327, 518),
                    (datetime(2023, 1, 23), "1.5.13", 227, 318),
                    (datetime(2023, 1, 24), "1.5.16", 127, 418),
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
                                data=[MetricValue(date="2023-01-22", value=327.0)],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.13"
                                    )
                                ],
                                data=[MetricValue(date="2023-01-23", value=227.0)],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.16"
                                    )
                                ],
                                data=[MetricValue(date="2023-01-24", value=127.0)],
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
                                data=[MetricValue(date="2023-01-22", value=518.0)],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.13"
                                    )
                                ],
                                data=[MetricValue(date="2023-01-23", value=318.0)],
                            ),
                            ComputedMetricData(
                                breakdown=[
                                    MetricBreakdown(
                                        property="property1", value="1.5.16"
                                    )
                                ],
                                data=[MetricValue(date="2023-01-24", value=418.0)],
                            ),
                        ],
                    ),
                ],
            ),
            (
                [
                    (datetime(2023, 1, 22), "1.5.9", "5009", 1.1),
                    (datetime(2023, 1, 22), "1.5.8", "5009", 1.4),
                    (datetime(2023, 1, 22), "1.5.8", "5007", 1.9),
                    (datetime(2023, 1, 22), "1.5.9", "5007", 0.9),
                    (datetime(2023, 1, 23), "1.5.9", "5009", 1.1),
                    (datetime(2023, 1, 23), "1.5.8", "5009", 1.4),
                    (datetime(2023, 1, 23), "1.5.8", "5007", 1.9),
                    (datetime(2023, 1, 23), "1.5.9", "5007", 0.9),
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
                start_date="2022-01-01",
                end_date="2023-01-01",
            )
            == result
        )
