import json
from unittest.mock import ANY

from domain.metrics.models import (
    SegmentsAndEvents,
    SegmentsAndEventsType,
    SegmentsAndEventsAggregations,
    SegmentsAndEventsFilter,
    SegmentsAndEventsFilterOperator,
    MetricBasicAggregation,
)


def test_compute_metric(
    client_init, compute_metric_request, computed_metric_response, metric_service
):
    """
    Test compute_metric
    """

    response = client_init.post(
        "/metrics/compute", data=json.dumps(compute_metric_request)
    )
    assert response.status_code == 200
    assert response.json() == computed_metric_response
    metric_service.compute_metric.assert_called_once_with(
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
                    filters=[
                        SegmentsAndEventsFilter(
                            operator=SegmentsAndEventsFilterOperator.EQUALS,
                            operand="properties.$city",
                            values=["Bengaluru"],
                        )
                    ],
                    conditions=["where"],
                )
            ],
            "breakdown": [],
            "datasource_id": "638f1aac8e54760eafc64d70",
            "date_filter": None,
            "function": "A",
        }
    )


def test_get_metrics(client_init, metric_service):
    response = client_init.get("/metrics?datasource_id=635ba034807ab86d8a2aadd9")

    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": "63d0df1ea1040a6388a4a34c",
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
            "appId": "63ca46feee94e38b81cda37a",
            "breakdown": [],
            "createdAt": ANY,
            "datasourceId": "63d0a7bfc636cee15d81f579",
            "function": "A/B",
            "name": "Video Metric",
            "revisionId": ANY,
            "updatedAt": ANY,
            "user": {
                "email": "test@email.com",
                "firstName": "Test",
                "lastName": "User",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
            },
            "userId": "6374b74e9b36ecf7e0b4f9e4",
            "dateFilter": None,
        }
    ]
    metric_service.get_metrics_for_datasource_id.assert_called_once_with(
        **{"datasource_id": "635ba034807ab86d8a2aadd9"}
    )


def test_validate_metric_formula(client_init, metric_service):
    response = client_init.post(
        "/metrics/validate_formula",
        data=json.dumps({"formula": "A,  B", "variableList": ["A", "B"]}),
    )
    assert response.status_code == 200
    assert response.json() == True
    metric_service.validate_formula.assert_called_with(
        **{"formula": "A,  B", "variable_list": ["A", "B"]}
    )
