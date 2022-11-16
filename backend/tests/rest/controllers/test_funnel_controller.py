import json
from tests.utils import filter_response


def test_create_funnel(client_init, funnel_data, funnel_response):
    response = client_init.post("/funnels", data=json.dumps(funnel_data))
    assert response.status_code == 200
    assert response.json().keys() == funnel_response.keys()
    assert filter_response(response.json()) == filter_response(funnel_response)


def test_compute_transient_funnel(
    client_init, funnel_data, computed_transient_funnel_response
):
    response = client_init.post("/funnels/transient", data=json.dumps(funnel_data))
    assert response.status_code == 200
    assert response.json() == computed_transient_funnel_response


def test_get_computed_funnel(client_init, computed_funnel_response):
    response = client_init.get("/funnels/635ba034807ab86d8a2aadd8")
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(computed_funnel_response)


def test_update_funnel(client_init, funnel_data, funnel_response):
    response = client_init.put(
        "/funnels/635ba034807ab86d8a2aadd8", data=json.dumps(funnel_data)
    )
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(funnel_response)
