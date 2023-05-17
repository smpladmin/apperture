from datetime import datetime
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import Depends

from domain.actions.models import (
    Action,
    ActionGroup,
    ComputedEventStreamResult,
    ComputedAction,
)
from domain.clickstream.models import CaptureEvent
from domain.common.date_models import DateFilter
from domain.common.date_utils import DateUtils
from mongo import Mongo
from repositories.clickhouse.actions import Actions


class ActionService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
        actions: Actions = Depends(),
        date_utils: DateUtils = Depends(),
    ):
        self.mongo = mongo
        self.actions = actions
        self.date_utils = date_utils

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

    async def get_action_by_name(self, name: str):
        return await Action.find(Action.name == name, Action.enabled != False).to_list()

    async def add_action(self, action: Action):
        action.updated_at = action.created_at
        await Action.insert(action)

    async def get_actions_for_datasource_id(self, datasource_id: str) -> List[Action]:
        return await Action.find(
            PydanticObjectId(datasource_id) == Action.datasource_id,
            Action.enabled != False,
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

    async def update_events_for_action(self, action: Action):
        await self.actions.update_events_from_clickstream(
            action=action, update_action_func=self.update_action_processed_till
        )

    async def get_action(self, id: str) -> Action:
        return await Action.find_one(
            Action.id == PydanticObjectId(id), Action.enabled != False
        )

    async def update_action(self, action_id: str, action: Action):
        to_update = action.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()
        to_update.pop("processed_till")

        await Action.find_one(
            Action.id == PydanticObjectId(action_id),
        ).update({"$set": to_update})

    def extract_date_range(self, date_filter: Union[DateFilter, None]):
        return (
            self.date_utils.compute_date_filter(
                date_filter=date_filter.filter, date_filter_type=date_filter.type
            )
            if date_filter and date_filter.filter and date_filter.type
            else (None, None)
        )

    async def compute_action(
        self,
        datasource_id: str,
        groups: List[ActionGroup],
        date_filter: Union[DateFilter, None],
    ) -> ComputedAction:
        start_date, end_date = self.extract_date_range(date_filter=date_filter)

        matching_events = await self.actions.get_matching_events_from_clickstream(
            datasource_id=datasource_id,
            groups=groups,
            start_date=start_date,
            end_date=end_date,
        )
        matching_events = [
            ComputedEventStreamResult(
                event=event,
                uid=uid,
                url=url,
                source=source,
                timestamp=timestamp,
            )
            for (event, uid, url, source, timestamp) in matching_events
        ]

        count = (
            await self.actions.get_count_of_matching_event_from_clickstream(
                datasource_id=datasource_id,
                groups=groups,
                start_date=start_date,
                end_date=end_date,
            )
        )[0][0]

        return ComputedAction(count=count, data=matching_events)

    async def delete_action(self, id=PydanticObjectId):
        selected_action = await Action.find_one(Action.id == id)
        await selected_action.update({"$set": {"enabled": False}})
        self.actions.delete_processed_events(
            ds_id=selected_action.datasource_id, event=selected_action.name
        )
