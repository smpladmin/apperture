import json
from unittest.mock import ANY

from beanie import PydanticObjectId

from domain.actions.models import ActionGroup, ActionGroupCondition, CaptureEvent
from tests.utils import filter_response


def test_create_action(client_init, action_data, action_service):
    response = client_init.post("/actions", data=json.dumps(action_data))
    assert response.status_code == 200
    assert filter_response(response.json()) == {
        "_id": None,
        "appId": "63e4da53370789982002e57d",
        "datasourceId": "63e4da53370789982002e57d",
        "groups": [
            {
                "condition": "or",
                "event": "$autocapture",
                "href": None,
                "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                "button",
                "tag_name": None,
                "text": None,
                "url": None,
                "url_matching": None,
            }
        ],
        "eventType": CaptureEvent.AUTOCAPTURE,
        "name": "clicked on settings",
        "processedTill": None,
        "userId": "63e4da53370789982002e57d",
        "enabled": True,
    }

    action_service.build_action.assert_called_once_with(
        **{
            "appId": PydanticObjectId("636a1c61d715ca6baae65611"),
            "datasourceId": PydanticObjectId("636a1c61d715ca6baae65611"),
            "groups": [
                ActionGroup(
                    tag_name=None,
                    text=None,
                    href=None,
                    selector="#__next > div > div.css-3h169z > div.css-8xl60i > button",
                    url=None,
                    url_matching=None,
                    event="$autocapture",
                    condition=ActionGroupCondition.OR,
                )
            ],
            "name": "clicked on settings",
            "userId": "mock-user-id",
        }
    )
    action_service.add_action.assert_called_once()
    assert action_service.add_action.call_args.kwargs["action"].dict() == {
        "app_id": PydanticObjectId("63e4da53370789982002e57d"),
        "created_at": ANY,
        "datasource_id": PydanticObjectId("63e4da53370789982002e57d"),
        "groups": [
            {
                "condition": ActionGroupCondition.OR,
                "event": CaptureEvent.AUTOCAPTURE,
                "href": None,
                "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                "button",
                "tag_name": None,
                "text": None,
                "url": None,
                "url_matching": None,
            }
        ],
        "id": None,
        "name": "clicked on settings",
        "event_type": CaptureEvent.AUTOCAPTURE,
        "processed_till": None,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("63e4da53370789982002e57d"),
        "enabled": True,
    }


def test_create_action_with_error(client_init, action_data, action_service):
    response = client_init.post("/actions", data=json.dumps(action_data))
    assert response.status_code == 400
    assert response.json() == {"detail": "Action name should be unique"}


def test_get_actions(client_init, action_service):
    response = client_init.get("/actions?datasource_id=63e4da53370789982002e57d")
    assert response.status_code == 200
    assert response.json() == [
        {
            "_id": None,
            "appId": "63e4da53370789982002e57d",
            "createdAt": ANY,
            "datasourceId": "63e4da53370789982002e57d",
            "groups": [
                {
                    "condition": "or",
                    "event": "$autocapture",
                    "href": None,
                    "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                    "button",
                    "tag_name": None,
                    "text": None,
                    "url": None,
                    "url_matching": None,
                }
            ],
            "name": "clicked on settings",
            "eventType": "$autocapture",
            "processedTill": None,
            "revisionId": ANY,
            "updatedAt": None,
            "user": {
                "email": "test@email.com",
                "firstName": "Test",
                "lastName": "User",
                "picture": "https://lh3.googleusercontent.com/a/ALm5wu2jXzCka6uU7Q-fAAEe88bpPG9_08a_WIzfqHOV=s96-c",
                "slackChannel": "#alerts",
            },
            "userId": "63e4da53370789982002e57d",
            "enabled": True,
        }
    ]
    action_service.get_actions_for_datasource_id.assert_called_once_with(
        **{"datasource_id": "63e4da53370789982002e57d"}
    )


def test_update_action(client_init, action_data, action_service):
    response = client_init.put(
        "/actions/63e236e89343884e21e0a07c", data=json.dumps(action_data)
    )
    assert response.status_code == 200
    assert filter_response(response.json()) == {
        "_id": None,
        "appId": "63e4da53370789982002e57d",
        "datasourceId": "63e4da53370789982002e57d",
        "groups": [
            {
                "condition": "or",
                "event": "$autocapture",
                "href": None,
                "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                "button",
                "tag_name": None,
                "text": None,
                "url": None,
                "url_matching": None,
            }
        ],
        "name": "clicked on settings",
        "eventType": CaptureEvent.AUTOCAPTURE,
        "processedTill": None,
        "userId": "63e4da53370789982002e57d",
        "enabled": True,
    }
    action_service.update_action.assert_called_once()
    assert action_service.update_action.call_args.kwargs["action"].dict() == {
        "app_id": PydanticObjectId("63e4da53370789982002e57d"),
        "created_at": ANY,
        "datasource_id": PydanticObjectId("63e4da53370789982002e57d"),
        "groups": [
            {
                "condition": ActionGroupCondition.OR,
                "event": "$autocapture",
                "href": None,
                "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                "button",
                "tag_name": None,
                "text": None,
                "url": None,
                "url_matching": None,
            }
        ],
        "id": None,
        "name": "clicked on settings",
        "event_type": CaptureEvent.AUTOCAPTURE,
        "processed_till": None,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("63e4da53370789982002e57d"),
        "enabled": True,
    }


def test_get_actions_by_id(client_init, action_service):
    response = client_init.get("/actions/63e5f57c593ed2017c0722c9")
    assert response.status_code == 200
    assert response.json() == {
        "_id": None,
        "appId": "63e4da53370789982002e57d",
        "createdAt": ANY,
        "datasourceId": "63e4da53370789982002e57d",
        "groups": [
            {
                "condition": "or",
                "event": CaptureEvent.AUTOCAPTURE,
                "href": None,
                "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                "button",
                "tag_name": None,
                "text": None,
                "url": None,
                "url_matching": None,
            }
        ],
        "name": "clicked on settings",
        "eventType": CaptureEvent.AUTOCAPTURE,
        "processedTill": None,
        "revisionId": ANY,
        "updatedAt": None,
        "userId": "63e4da53370789982002e57d",
        "enabled": True,
    }
    action_service.get_action.assert_called_once_with(
        **{"id": "63e5f57c593ed2017c0722c9"}
    )


def test_transient_action(client_init, action_service, transient_action_data):
    response = client_init.post(
        "/actions/transient", data=json.dumps(transient_action_data)
    )
    assert response.status_code == 200
    assert response.json() == {
        "count": 1,
        "data": [
            {
                "event": "$autocapture",
                "source": "web",
                "timestamp": "2023-02-09T10:26:22",
                "uid": "18635b641091067-0b29b2c45f4c5d-16525635-16a7f0-18635b6410a285c",
                "url": "http://localhost:3000/analytics/explore/63e236e89343884e21e0a07c",
            }
        ],
    }
    action_service.compute_action.assert_called_once_with(
        **{
            "datasource_id": "63e4da53370789982002e57d",
            "groups": [
                {
                    "condition": "or",
                    "event": "$autocapture",
                    "href": None,
                    "selector": "#__next > div > div.css-3h169z > div.css-8xl60i > "
                    "button",
                    "tag_name": None,
                    "text": None,
                    "url": None,
                    "url_matching": None,
                }
            ],
        }
    )


def test_delete_action(client_init, action_service):
    response = client_init.delete("/actions/640eb512d7365a722ee65400")
    assert response.status_code == 200
    action_service.delete_action.assert_called_once_with(
        id=PydanticObjectId("640eb512d7365a722ee65400")
    )
