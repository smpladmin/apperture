from unittest.mock import MagicMock
from repositories.clickhouse.metric import Metric

from domain.metrics.models import (
    SegmentsAndEventsFilterOperator,
    SegmentsAndEventsFilter,
    SegmentsAndEvents,
    SegmentsAndEventsAggregationsFunctions,
    SegmentsAndEventsType,
    SegmentsAndEventsAggregations,
)


class TestMetricRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Metric(self.clickhouse)
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "638f1aac8e54760eafc64d70"
        self.aggregates = [
            SegmentsAndEvents(
                variable="A",
                variant=SegmentsAndEventsType.EVENT,
                aggregations=SegmentsAndEventsAggregations(
                    functions=SegmentsAndEventsAggregationsFunctions.COUNT,
                    property="Video_Open",
                ),
                reference_id="Video_Open",
                filters=[
                    SegmentsAndEventsFilter(
                        operator=SegmentsAndEventsFilterOperator.Equal,
                        operand="properties.$city",
                        values=["Bengaluru"],
                    )
                ],
                conditions=["where"],
            )
        ]
