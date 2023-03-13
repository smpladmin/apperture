from datetime import datetime
from typing import List

from beanie import PydanticObjectId
from fastapi import Depends

from domain.actions.models import Action, ActionGroup, ComputedEventStreamResult
from domain.clickstream.models import CaptureEvent
from mongo import Mongo
from repositories.clickhouse.actions import Actions
from rest.dtos.actions import ComputedActionResponse


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
            and Action.is_deleted != True
        ).to_list()

    async def update_action_processed_till(
        self, action_id: PydanticObjectId, processed_till: datetime
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

    async def get_action(self, id: str) -> Action:
        return await Action.find_one(Action.id == id and Action.is_deleted != True)

    async def update_action(self, action_id: str, action: Action):
        to_update = action.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()
        to_update.pop("processed_till")

        await Action.find_one(
            Action.id == PydanticObjectId(action_id),
        ).update({"$set": to_update})

    async def compute_action(
        self, datasource_id: str, groups: List[ActionGroup]
    ) -> List[ComputedActionResponse]:
        matching_events = await self.actions.get_matching_events_from_clickstream(
            datasource_id=datasource_id, groups=groups
        )
        matching_events = [
            ComputedEventStreamResult(
                event=event[0],
                uid=event[1],
                url=event[2].get("$current_url", None),
                source=event[2].get("$lib", None),
                timestamp=event[3],
            )
            for event in matching_events
        ]

        count = (
            await self.actions.get_count_of_matching_event_from_clickstream(
                datasource_id=datasource_id, groups=groups
            )
        )[0][0]

        return ComputedActionResponse(count=count, data=matching_events)

    async def delete_action(self, id=PydanticObjectId):
        await self.actions.delete_action(id=id)
