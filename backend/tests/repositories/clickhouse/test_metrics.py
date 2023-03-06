from unittest.mock import MagicMock

from domain.metrics.models import (
    SegmentsAndEvents,
    SegmentsAndEventsAggregations,
    SegmentsAndEventsAggregationsFunctions,
    SegmentsAndEventsFilter,
    SegmentsAndEventsFilterOperator,
    SegmentsAndEventsType,
)
from repositories.clickhouse.metric import Metrics


class TestMetricRepository:
    def setup_method(self):
        self.clickhouse = MagicMock()
        repo = Metrics()
        repo.execute_get_query = MagicMock()
        self.repo = repo
        self.datasource_id = "638f1aac8e54760eafc64d70"
        self.aggregates = [
            SegmentsAndEvents(
                variable="A",
                variant=SegmentsAndEventsType.EVENT,
                aggregations=SegmentsAndEventsAggregations(
                    functions=SegmentsAndEventsAggregationsFunctions.COUNT,
                    property="Video_Seen",
                ),
                reference_id="Video_Seen",
                filters=[
                    SegmentsAndEventsFilter(
                        operator=SegmentsAndEventsFilterOperator.EQUALS,
                        operand="properties.$city",
                        values=["Bengaluru"],
                    )
                ],
                conditions=["where"],
            )
        ]
        self.multi_aggregates = [
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
        self.breakdown = []
        self.function = "A"
        self.params = {"ds_id": "638f1aac8e54760eafc64d70", "property_0": "Video_Seen"}
        self.start_date = "2022-10-8"
        self.end_date = "2022-10-20"

        self.query = (
            'SELECT date,SUM("A") FROM (SELECT DATE("timestamp") AS "date",CASE WHEN '
            '"event_name"=%(property_0)s AND "properties.properties.$city" IN '
            '(\'Bengaluru\') THEN 1 ELSE 0 END AS "A" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s) AS "subquery" GROUP BY date ORDER BY 1 LIMIT 1000'
        )
        self.date_filter_query = (
            'SELECT date,SUM("A") FROM (SELECT DATE("timestamp") AS "date",CASE WHEN '
            '"event_name"=%(property_0)s AND "properties.properties.$city" IN '
            '(\'Bengaluru\') THEN 1 ELSE 0 END AS "A" FROM "events" WHERE '
            '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=\'2022-10-8\' AND '
            'DATE("timestamp")<=\'2022-10-20\') AS "subquery" GROUP BY date ORDER BY 1 '
            "LIMIT 1000"
        )

    def test_build_metric_compute_query(self):
        assert self.repo.build_metric_compute_query(
            self.datasource_id,
            self.aggregates,
            self.breakdown,
            self.function,
            None,
            None,
        ) == (self.query, self.params)

    def test_build_metric_compute_query_with_date(self):
        assert self.repo.build_metric_compute_query(
            self.datasource_id,
            self.aggregates,
            self.breakdown,
            self.function,
            self.start_date,
            self.end_date,
        ) == (self.date_filter_query, self.params)

    def test_build_metric_compute_query_for_multiple_functions_with_breakdown(self):
        assert self.repo.build_metric_compute_query(
            self.datasource_id,
            self.multi_aggregates,
            ["property1"],
            "A,B",
            self.start_date,
            self.end_date,
        ) == (
            (
                'SELECT date,"properties.property1",SUM("A"),SUM("B") FROM (SELECT '
                'DATE("timestamp") AS "date","properties.property1",CASE WHEN '
                '"event_name"=%(property_0)s THEN 1 ELSE 0 END AS "A",CASE WHEN '
                '"event_name"=%(property_1)s THEN 1 ELSE 0 END AS "B" FROM "events" WHERE '
                '"datasource_id"=%(ds_id)s AND DATE("timestamp")>=\'2022-10-8\' AND '
                'DATE("timestamp")<=\'2022-10-20\') AS "subquery" GROUP BY '
                'date,"properties.property1" ORDER BY 1,2 LIMIT 1000'
            ),
            {
                "ds_id": "638f1aac8e54760eafc64d70",
                "property_0": "Video_Seen",
                "property_1": "Video_Open",
            },
        )

    def test_build_metric_compute_query_with_failure(self):
        assert self.repo.build_metric_compute_query(
            self.datasource_id,
            self.aggregates,
            self.breakdown,
            "AB",
            self.start_date,
            self.end_date,
        ) == (None, None)

        assert self.repo.build_metric_compute_query(
            self.datasource_id,
            self.aggregates,
            self.breakdown,
            "A*123/B+C",
            self.start_date,
            self.end_date,
        ) == (
            (
                'SELECT date,SUM("A")*123/SUM("B")+SUM("C") FROM (SELECT DATE("timestamp") AS '
                '"date",CASE WHEN "event_name"=%(property_0)s AND '
                '"properties.properties.$city" IN (\'Bengaluru\') THEN 1 ELSE 0 END AS "A" '
                'FROM "events" WHERE "datasource_id"=%(ds_id)s AND '
                "DATE(\"timestamp\")>='2022-10-8' AND DATE(\"timestamp\")<='2022-10-20') AS "
                '"subquery" GROUP BY date HAVING SUM("B")<>0 ORDER BY 1 LIMIT 1000'
            ),
            {"ds_id": "638f1aac8e54760eafc64d70", "property_0": "Video_Seen"},
        )

        assert self.repo.build_metric_compute_query(
            self.datasource_id,
            self.aggregates,
            self.breakdown,
            "A*123@+C",
            self.start_date,
            self.end_date,
        ) == (None, None)
