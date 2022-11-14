import json
from tests.utils import filter_response


def test_create_funnel(client_init, funnel_data, funnel_response):
    response = client_init.post("/funnels", data=json.dumps(funnel_data))
    assert response.status_code == 200
    assert response.json().keys() == funnel_response.keys()
    assert filter_response(response.json()) == filter_response(funnel_response)


def test_compute_transient_funnel(client_init, funnel_data, computed_funnel_response):
    response = client_init.post("/funnels/transient", data=json.dumps(funnel_data))
    assert response.status_code == 200
    assert response.json() == computed_funnel_response
