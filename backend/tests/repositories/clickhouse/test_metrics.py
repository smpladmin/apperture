from unittest.mock import MagicMock
from repositories.clickhouse.metric import Metrics

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
        repo = Metrics
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
        self.breakdown=[]
        self.function='A'
        self.params={'ds_id':self.datasource_id}

        self.query='SELECT date,SUM("A") FROM (SELECT DATE("timestamp") AS "date",CASE WHEN event_name=\'Video_Seen\' AND "properties.properties.$city" IN (\'Bengaluru\') THEN 1 ELSE 0 END AS "A",DATE("timestamp") AS "date" FROM "events" WHERE "datasource_id"=%(ds_id)s AND "datasource_id"=%(ds_id)s) AS "innerquery" GROUP BY date'

        def test_build_metric_compute_query(self):
            assert self.repo.build_metric_compute_query(
                self.datasource_id,
                self.aggregates,
                self.breakdown,
                self.function
                ) == (self.query,self.params)