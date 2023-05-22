from datetime import datetime

from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Set
from fastapi import Depends

from domain.common.models import Property
from domain.event_properties.models import EventProperties
from mongo import Mongo
from rest.dtos.event_properties import EventPropertiesDto


class EventPropertiesService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
    ):
        self.mongo = mongo

    async def update_event_properties(self, ds_id: str, event_properties: EventPropertiesDto):
        event_properties = EventProperties(
                datasource_id=ds_id,
                event=event_properties.event,
                properties=[Property(name=property, type="string")for property in event_properties.properties],
                provider=event_properties.provider,
            )

        await EventProperties.find_one(
            EventProperties.datasource_id == PydanticObjectId(ds_id),
            EventProperties.event == event_properties.event
        ).upsert(
            Set(
                {EventProperties.properties: event_properties.properties, EventProperties.updated_at: datetime.utcnow()}
            ),
            on_insert=event_properties,
        )

        return event_properties
