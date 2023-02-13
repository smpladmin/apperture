import datetime
from collections import namedtuple
from unittest.mock import MagicMock, AsyncMock, ANY

import pytest
from beanie import PydanticObjectId

from domain.actions.models import Action, ActionGroup, ActionGroupCondition
from domain.actions.service import ActionService
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource


class TestActionService:
    def setup_method(self):
        Action.get_settings = MagicMock()
        Action.insert = AsyncMock()
        Action.get = AsyncMock()
        DataSource.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.actions = AsyncMock()
        self.service = ActionService(mongo=self.mongo, actions=self.actions)
        self.ds_id = "636a1c61d715ca6baae65611"
        self.app_id = "636a1c61d715ca6baae65612"
        self.provider = IntegrationProvider.MIXPANEL
        self.user_id = "636a1c61d715ca6baae65611"
        self.name = "name"
        self.id = "636a1c61d715ca6baae65611"
        FindMock = namedtuple("FindMock", ["to_list"])
        Action.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        self.action = Action(
            datasource_id=self.ds_id,
            app_id=self.app_id,
            user_id=self.user_id,
            name="clicked on settings",
            groups=[
                ActionGroup(
                    selector="#__next > div > div.css-3h169z > div.css-8xl60i > button"
                )
            ],
        )
        Action.datasource_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Action.id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        self.update_mock = AsyncMock()
        FindOneMock = namedtuple("FindOneMock", ["update"])
        Action.find_one = MagicMock(return_value=FindOneMock(update=self.update_mock))

    @pytest.mark.asyncio
    async def test_add_action(self):
        await self.service.add_action(self.action)
        assert Action.insert.call_args.args[0].dict() == {
            "app_id": PydanticObjectId("636a1c61d715ca6baae65612"),
            "created_at": ANY,
            "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
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
            "updated_at": ANY,
            "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        }

    @pytest.mark.asyncio
    async def test_get_actions_for_datasource_id(self):
        await self.service.get_actions_for_datasource_id(datasource_id=self.ds_id)
        Action.find.assert_called_once()
        assert Action.find.call_args.args == (False,)

    @pytest.mark.asyncio
    async def test_update_action_processed_till(self):
        await self.service.update_action_processed_till(
            action_id=PydanticObjectId(self.ds_id),
            processed_till=datetime.datetime(2023, 1, 1),
        )
        Action.find_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_events_from_clickstream(self):
        self.actions.update_events_from_clickstream.return_value = []
        self.service.get_actions_for_datasource_id = AsyncMock(
            return_value=[self.action]
        )
        await self.service.update_events_from_clickstream(datasource_id=self.ds_id)
        assert self.actions.update_events_from_clickstream.call_args.kwargs[
            "action"
        ].dict() == {
            "app_id": PydanticObjectId("636a1c61d715ca6baae65612"),
            "created_at": ANY,
            "datasource_id": PydanticObjectId("636a1c61d715ca6baae65611"),
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
            "user_id": PydanticObjectId("636a1c61d715ca6baae65611"),
        }

    @pytest.mark.asyncio
    async def test_get_actions_by_id(self):
        await self.service.get_action(id=self.id)
        Action.get.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_action(self):
        await self.service.update_action(action_id=self.id, action=self.action)
        Action.find_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_compute_action(self):
        await self.service.compute_action(
            datasource_id=self.ds_id, groups=self.action.groups, event="$autocapture"
        )
        self.actions.get_matching_events_from_clickstream.assert_called_once_with(
            **{
                "datasource_id": "636a1c61d715ca6baae65611",
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
                "event": "$autocapture",
            }
        )
        self.actions.get_count_of_matching_event_from_clickstream.assert_called_once_with(
            **{
                "datasource_id": "636a1c61d715ca6baae65611",
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
                "event": "$autocapture",
            }
        )
