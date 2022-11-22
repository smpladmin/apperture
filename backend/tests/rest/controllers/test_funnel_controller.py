import json
from unittest.mock import ANY
from beanie import PydanticObjectId

from tests.utils import filter_response
from domain.funnels.models import FunnelStep, EventFilters, Funnel


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


def test_get_computed_funnel(
    client_init, computed_funnel_response, funnel_service, datasource_service
):
    response = client_init.get("/funnels/635ba034807ab86d8a2aadd8")
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(computed_funnel_response)

    funnel_service.get_funnel.assert_called_once_with(
        "635ba034807ab86d8a2aadd8",
    )
    get_computed_funnel_kwargs = funnel_service.get_computed_funnel.call_args.kwargs
    funnel_service.get_computed_funnel.assert_called_once()

    assert {
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "name": "name",
        "random_sequence": False,
        "revision_id": ANY,
        "steps": [
            {
                "event": "Login",
                "filters": [{"property": "mp_country_code", "value": "IN"}],
            },
            {"event": "Chapter_Click", "filters": None},
            {
                "event": "Topic_Click",
                "filters": [{"property": "os", "value": "Android"}],
            },
        ],
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
    } == get_computed_funnel_kwargs["funnel"].dict()


def test_update_funnel(
    client_init, funnel_data, funnel_response, funnel_service, mock_user_id
):
    response = client_init.put(
        "/funnels/635ba034807ab86d8a2aadd8", data=json.dumps(funnel_data)
    )
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(funnel_response)

    funnel_service.build_funnel.assert_called_with(
        funnel_data["datasourceId"],
        mock_user_id,
        funnel_data["name"],
        [
            FunnelStep(
                event="Login",
                filters=[EventFilters(property="mp_country_code", value="IN")],
            ),
            FunnelStep(event="Chapter_Click", filters=None),
            FunnelStep(
                event="Topic_Click",
                filters=[EventFilters(property="os", value="Android")],
            ),
        ],
        funnel_data["randomSequence"],
    )

    update_funnel_kwargs = funnel_service.update_funnel.call_args.kwargs
    funnel_service.update_funnel.assert_called_once()

    assert {
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "name": "name",
        "random_sequence": False,
        "revision_id": ANY,
        "steps": [
            {
                "event": "Login",
                "filters": [{"property": "mp_country_code", "value": "IN"}],
            },
            {"event": "Chapter_Click", "filters": None},
            {
                "event": "Topic_Click",
                "filters": [{"property": "os", "value": "Android"}],
            },
        ],
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
    } == update_funnel_kwargs["new_funnel"].dict()

    assert "635ba034807ab86d8a2aadd8" == update_funnel_kwargs["funnel_id"]


def test_get_funnel_trends(client_init, funnel_trend_response, funnel_service):
    response = client_init.get("/funnels/635ba034807ab86d8a2aadd8/trends")
    assert response.status_code == 200
    assert response.json() == funnel_trend_response

    funnel_service.get_funnel_trends.assert_called_once()
    get_funnel_trends_kwargs = funnel_service.get_funnel_trends.call_args.kwargs

    assert {
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "name": "name",
        "random_sequence": False,
        "revision_id": ANY,
        "steps": [
            {
                "event": "Login",
                "filters": [{"property": "mp_country_code", "value": "IN"}],
            },
            {"event": "Chapter_Click", "filters": None},
            {
                "event": "Topic_Click",
                "filters": [{"property": "os", "value": "Android"}],
            },
        ],
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
    } == get_funnel_trends_kwargs["funnel"].dict()
