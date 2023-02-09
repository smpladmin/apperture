import json
from unittest.mock import ANY
from beanie import PydanticObjectId

from domain.actions.models import ActionGroup, ActionGroupCondition
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
                "event": None,
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
        "processedTill": None,
        "userId": "63e4da53370789982002e57d",
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
                    event=None,
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
                "event": None,
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
        "processed_till": None,
        "revision_id": ANY,
        "updated_at": None,
        "user_id": PydanticObjectId("63e4da53370789982002e57d"),
    }


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
                    "event": None,
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
        }
    ]
    action_service.get_actions_for_datasource_id.assert_called_once_with(
        **{"datasource_id": "63e4da53370789982002e57d"}
    )
