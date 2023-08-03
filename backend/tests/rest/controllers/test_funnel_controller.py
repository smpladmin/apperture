import json
from unittest.mock import ANY

import pytest
from beanie import PydanticObjectId

from domain.funnels.models import FunnelStep
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


def test_get_saved_funnel(client_init, funnel_service, funnel_response):
    response = client_init.get("/funnels/635ba034807ab86d8a2aadd8")
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(funnel_response)

    funnel_service.get_funnel.assert_called_once_with(
        "635ba034807ab86d8a2aadd8",
    )


@pytest.mark.asyncio
async def test_update_funnel(
    client_init,
    funnel_data,
    datasource_service,
    funnel_response,
    funnel_service,
    mock_user_id,
    notification_service,
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
        None,
        None,
        None,
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
        "date_filter": None,
        "enabled": True,
        "conversion_window": None,
        "segment_filter": None,
    } == update_funnel_kwargs["new_funnel"].dict()

    assert "635ba034807ab86d8a2aadd8" == update_funnel_kwargs["funnel_id"]

    notification_service.fetch_and_delete_notification.assert_called_once_with(
        **{
            "reference_id": "635ba034807ab86d8a2aadd8",
            "datasource_id": "636a1c61d715ca6baae65611",
        }
    )


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
            "date_filter": None,
            "conversion_window": None,
            "random_sequence": False,
            "segment_filter": None,
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
            "date_filter": None,
            "conversion_window": None,
            "random_sequence": False,
            "segment_filter": None,
        }
    )


def test_transient_funnel_analytics(
    client_init, funnel_conversion_request, funnel_user_conversion_response
):
    response = client_init.post(
        "/funnels/analytics/transient", data=json.dumps(funnel_conversion_request)
    )

    assert response.status_code == 200
    assert response.json() == funnel_user_conversion_response


def test_get_funnels(client_init, funnel_service):
    response = client_init.get("/funnels?datasource_id=635ba034807ab86d8a2aadd9")

    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": "635ba034807ab86d8a2aadd8",
            "appId": "635ba034807ab86d8a2aadd7",
            "createdAt": ANY,
            "datasourceId": "635ba034807ab86d8a2aadd9",
            "name": "name",
            "randomSequence": False,
            "revisionId": ANY,
            "steps": [
                {"event": "Login", "filters": None},
                {"event": "Chapter_Click", "filters": None},
                {"event": "Topic_Click", "filters": None},
            ],
            "updatedAt": ANY,
            "user": {
                "id": "635ba034807ab86d8a2aadd8",
                "email": "test@email.com",
                "firstName": "Test",
                "lastName": "User",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
                "hasVisitedSheets": False,
            },
            "userId": "635ba034807ab86d8a2aadda",
            "dateFilter": None,
            "enabled": True,
            "conversionWindow": None,
            "segmentFilter": None,
        }
    ]
    funnel_service.get_funnels_for_datasource_id.assert_called_once_with(
        **{"datasource_id": "635ba034807ab86d8a2aadd9"}
    )


def test_delete_funnel(client_init, funnel_service, notification_service):
    response = client_init.delete(
        "/funnels/6384a65e0a397236d9de236a?datasource_id=6384a65e0a397236d9de236a"
    )
    assert response.status_code == 200

    funnel_service.delete_funnel.assert_called_once_with(
        **{
            "funnel_id": "6384a65e0a397236d9de236a",
        }
    )

    notification_service.fetch_and_delete_notification.assert_called_with(
        **{
            "reference_id": "6384a65e0a397236d9de236a",
            "datasource_id": "6384a65e0a397236d9de236a",
        }
    )


@pytest.mark.asyncio
async def test_get_saved_funnels_for_app(client_init, funnel_service):
    response = client_init.get("/funnels?app_id=63d0a7bfc636cee15d81f579")

    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": "635ba034807ab86d8a2aadd8",
            "revisionId": None,
            "createdAt": ANY,
            "updatedAt": None,
            "datasourceId": "635ba034807ab86d8a2aadd9",
            "appId": "635ba034807ab86d8a2aadd7",
            "userId": "635ba034807ab86d8a2aadda",
            "name": "name",
            "steps": [
                {"event": "Login", "filters": None},
                {"event": "Chapter_Click", "filters": None},
                {"event": "Topic_Click", "filters": None},
            ],
            "randomSequence": False,
            "dateFilter": None,
            "conversionWindow": None,
            "segmentFilter": None,
            "enabled": True,
            "user": {
                "id": "635ba034807ab86d8a2aadd8",
                "firstName": "Test",
                "lastName": "User",
                "email": "test@email.com",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
                "hasVisitedSheets": False,
            },
        }
    ]
    funnel_service.get_funnels_for_apps.assert_called_once_with(
        **{"app_ids": [PydanticObjectId("635ba034807ab86d8a2aadd9")]}
    )
