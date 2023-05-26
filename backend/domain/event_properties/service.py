from collections import defaultdict
from datetime import datetime
from typing import List

from beanie import PydanticObjectId
from beanie.odm.operators.update.general import Set
from fastapi import Depends

from domain.common.models import Property, IntegrationProvider
from domain.event_properties.models import EventProperties
from mongo import Mongo
from rest.dtos.event_properties import EventPropertiesDto


class EventPropertiesService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
    ):
        self.mongo = mongo

    def create_events_map(self, event_properties: List[EventProperties]):
        res = defaultdict(dict)
        for event in event_properties:
            res[str(event.datasource_id)].setdefault(event.event, []).extend(
                property.name for property in event.properties
            )
        return dict(res)

    async def get_event_properties(self):
        event_properties = await EventProperties.find(
            EventProperties.provider == IntegrationProvider.APPERTURE
        ).to_list()

        return self.create_events_map(event_properties=event_properties)

    async def update_event_properties(
        self, datasource_id: str, event_properties: EventPropertiesDto
    ):
        event_properties = EventProperties(
            datasource_id=datasource_id,
            event=event_properties.event,
            properties=[
                Property(name=property, type="default")
                for property in event_properties.properties
            ],
            provider=event_properties.provider,
        )

        await EventProperties.find_one(
            EventProperties.datasource_id == PydanticObjectId(datasource_id),
            EventProperties.event == event_properties.event,
        ).upsert(
            Set(
                {
                    EventProperties.properties: event_properties.properties,
                    EventProperties.updated_at: datetime.utcnow(),
                }
            ),
            on_insert=event_properties,
        )

        return event_properties
