import json
from unittest.mock import ANY

import pytest
from beanie import PydanticObjectId

from domain.common.date_models import DateFilter, LastDateFilter, DateFilterType
from domain.retention.models import EventSelection, Granularity
from tests.utils import filter_response


def test_create_retention(client_init, retention_data, retention_response):
    response = client_init.post("/retention", data=json.dumps(retention_data))
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(retention_response)


def test_get_retention(client_init, retention_service, retention_response):
    response = client_init.get("/retention/635ba034807ab86d8a2aadd8")
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(retention_response)

    retention_service.get_retention.assert_called_once_with(
        "635ba034807ab86d8a2aadd8",
    )


@pytest.mark.asyncio
async def test_update_retention(
    client_init,
    retention_data,
    datasource_service,
    retention_response,
    retention_service,
    mock_user_id,
):
    response = client_init.put(
        "/retention/635ba034807ab86d8a2aadd8", data=json.dumps(retention_data)
    )
    assert response.status_code == 200
    assert filter_response(response.json()) == filter_response(retention_response)
    datasource_service.get_datasource.assert_called_with(
        "635ba034807ab86d8a2aadd9",
    )
    retention_service.build_retention.assert_called_with(
        **{
            "app_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
            "date_filter": DateFilter(
                filter=LastDateFilter(days=4), type=DateFilterType.LAST
            ),
            "goal_event": EventSelection(event="goal_event", filters=None),
            "granularity": Granularity.DAYS,
            "name": "test",
            "segment_filter": None,
            "start_event": EventSelection(event="start_event", filters=None),
            "user_id": "mock-user-id",
        }
    )

    update_retention_kwargs = retention_service.update_retention.call_args.kwargs
    retention_service.update_retention.assert_called_once()

    assert {
        "app_id": PydanticObjectId("635ba034807ab86d8a2aadd7"),
        "created_at": ANY,
        "datasource_id": ANY,
        "date_filter": {"filter": {"days": 4}, "type": DateFilterType.LAST},
        "enabled": True,
        "goal_event": {"event": "goal_event", "filters": None},
        "granularity": Granularity.DAYS,
        "id": PydanticObjectId("635ba034807ab86d8a2aadd8"),
        "name": "name",
        "revision_id": None,
        "segment_filter": None,
        "start_event": {"event": "start_event", "filters": None},
        "updated_at": None,
        "user_id": PydanticObjectId("635ba034807ab86d8a2aadda"),
    } == update_retention_kwargs["new_retention"].dict()

    assert "635ba034807ab86d8a2aadd8" == update_retention_kwargs["retention_id"]


def test_compute_transient_retention(
    client_init,
    retention_transient_data,
    transient_retention_response,
    retention_service,
):
    response = client_init.post(
        "/retention/transient",
        data=json.dumps(retention_transient_data),
    )
    assert response.status_code == 200
    assert response.json() == transient_retention_response

    retention_service.compute_retention.assert_called_with(
        **{
            "datasource_id": "635ba034807ab86d8a2aadd9",
            "date_filter": DateFilter(
                filter=LastDateFilter(days=4), type=DateFilterType.LAST
            ),
            "goal_event": EventSelection(event="goal_event", filters=None),
            "granularity": Granularity.DAYS,
            "segment_filter": None,
            "start_event": EventSelection(event="start_event", filters=None),
        }
    )


def test_get_retention_list(client_init, retention_service):
    response = client_init.get("/retention?datasource_id=635ba034807ab86d8a2aadd9")

    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": "635ba034807ab86d8a2aadd8",
            "appId": "635ba034807ab86d8a2aadd7",
            "createdAt": ANY,
            "datasourceId": "635ba034807ab86d8a2aadd9",
            "dateFilter": {"filter": {"days": 4}, "type": "last"},
            "enabled": True,
            "goalEvent": {"event": "goal_event", "filters": None},
            "granularity": "days",
            "name": "name",
            "revisionId": ANY,
            "segmentFilter": None,
            "startEvent": {"event": "start_event", "filters": None},
            "updatedAt": ANY,
            "user": {
                "email": "test@email.com",
                "firstName": "Test",
                "id": "635ba034807ab86d8a2aadd8",
                "lastName": "User",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
            },
            "userId": "635ba034807ab86d8a2aadda",
        }
    ]
    retention_service.get_retentions_for_datasource_id.assert_called_once_with(
        **{"datasource_id": "635ba034807ab86d8a2aadd9"}
    )


def test_delete_retention(client_init, retention_service):
    response = client_init.delete(
        "/retention/6384a65e0a397236d9de236a?datasource_id=6384a65e0a397236d9de236a"
    )
    assert response.status_code == 200

    retention_service.delete_retention.assert_called_once_with(
        **{
            "retention_id": "6384a65e0a397236d9de236a",
        }
    )
