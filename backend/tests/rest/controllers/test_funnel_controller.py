import json
from unittest.mock import ANY

import pytest
from beanie import PydanticObjectId

from tests.utils import filter_response
from domain.funnels.models import FunnelStep


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
        "app_id": PydanticObjectId("635ba034807ab86d8a2aadd7"),
        "name": "name",
        "random_sequence": False,
        "revision_id": ANY,
        "steps": [
            {
                "event": "Login",
                "filters": None,
            },
            {"event": "Chapter_Click", "filters": None},
            {
                "event": "Topic_Click",
                "filters": None,
            },
        ],
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
    } == get_computed_funnel_kwargs["funnel"].dict()


@pytest.mark.asyncio
async def test_update_funnel(
    client_init,
    funnel_data,
    datasource_service,
    funnel_response,
    funnel_service,
    mock_user_id,
):
    response = client_init.put(
        "/funnels/635ba034807ab86d8a2aadd8", data=json.dumps(funnel_data)
    )
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(funnel_response)
    datasource_service.get_datasource.assert_called_with(
        "636a1c61d715ca6baae65611",
    )
    funnel_service.build_funnel.assert_called_with(
        PydanticObjectId(funnel_data["datasourceId"]),
        PydanticObjectId(funnel_data["appId"]),
        mock_user_id,
        funnel_data["name"],
        [
            FunnelStep(
                event="Login",
                filters=None,
            ),
            FunnelStep(event="Chapter_Click", filters=None),
            FunnelStep(
                event="Topic_Click",
                filters=None,
            ),
        ],
        funnel_data["randomSequence"],
    )

    update_funnel_kwargs = funnel_service.update_funnel.call_args.kwargs
    funnel_service.update_funnel.assert_called_once()

    assert {
        "created_at": ANY,
        "datasource_id": PydanticObjectId("635ba034807ab86d8a2aadd9"),
        "app_id": PydanticObjectId("635ba034807ab86d8a2aadd7"),
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "name": "name",
        "random_sequence": False,
        "revision_id": ANY,
        "steps": [
            {
                "event": "Login",
                "filters": None,
            },
            {"event": "Chapter_Click", "filters": None},
            {
                "event": "Topic_Click",
                "filters": None,
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

    funnel_service.get_funnel_trends.assert_called_once_with(
        **{
            "datasource_id": "635ba034807ab86d8a2aadd9",
            "steps": [
                FunnelStep(
                    event="Login",
                    filters=None,
                ),
                FunnelStep(event="Chapter_Click", filters=None),
                FunnelStep(
                    event="Topic_Click",
                    filters=None,
                ),
            ],
        }
    )


def test_get_transient_funnel_trends(
    client_init, funnel_data, funnel_trend_response, funnel_service
):
    response = client_init.post(
        "/funnels/trends/transient", data=json.dumps(funnel_data)
    )
    assert response.status_code == 200
    assert response.json() == funnel_trend_response

    funnel_service.get_funnel_trends.assert_called_with(
        **{
            "datasource_id": "636a1c61d715ca6baae65611",
            "steps": [
                FunnelStep(
                    event="Login",
                    filters=None,
                ),
                FunnelStep(event="Chapter_Click", filters=None),
                FunnelStep(
                    event="Topic_Click",
                    filters=None,
                ),
            ],
        }
    )
