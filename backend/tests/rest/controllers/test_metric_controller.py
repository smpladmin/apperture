import json


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
