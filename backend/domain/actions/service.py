import datetime
from typing import List

from domain.actions.models import ActionGroup, Action
from mongo import Mongo
from fastapi import Depends
from beanie import PydanticObjectId

from repositories.clickhouse.actions import Actions


class ActionService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        actions: Actions = Depends(),
    ):
        self.mongo = mongo
        self.actions = actions

    def build_action(
        self,
        datasourceId: PydanticObjectId,
        appId: PydanticObjectId,
        userId: str,
        name: str,
        groups: List[ActionGroup],
    ) -> Action:
        return Action(
            datasource_id=datasourceId,
            app_id=appId,
            user_id=userId,
            name=name,
            groups=groups,
        )

    async def add_action(self, action: Action):
        action.updated_at = action.created_at
        await Action.insert(action)

    async def get_actions_for_datasource_id(self, datasource_id: str) -> List[Action]:
        return await Action.find(
            PydanticObjectId(datasource_id) == Action.datasource_id
        ).to_list()

    async def update_action_processed_till(
        self, action_id: PydanticObjectId, processed_till: datetime.datetime
    ):
        await Action.find_one(
            Action.id == action_id,
        ).update({"$set": {"processed_till": processed_till}})
        return

    async def update_events_from_clickstream(self, datasource_id: str):
        actions = await self.get_actions_for_datasource_id(datasource_id=datasource_id)
        for action in actions:
            await self.actions.update_events_from_clickstream(
                action=action, update_action_func=self.update_action_processed_till
            )
