from datetime import datetime
from typing import List

from beanie.odm.operators.update.general import Set
from fastapi import Depends

from domain.clickstream_event_properties.models import ClickStreamEventProperties
from domain.common.models import Property
from mongo import Mongo
from rest.dtos.clickstream_event_properties import ClickStreamEventPropertiesDto


class ClickStreamEventPropertiesService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
    ):
        self.mongo = mongo

    async def get_event_properties(self) -> List[ClickStreamEventProperties]:
        return await ClickStreamEventProperties.find().to_list()

    async def update_event_properties(
        self, event_properties: ClickStreamEventPropertiesDto
    ):
        event_properties = ClickStreamEventProperties(
            event=event_properties.event,
            properties=[
                Property(name=property, type="default")
                for property in event_properties.properties
            ],
        )

        await ClickStreamEventProperties.find_one(
            ClickStreamEventProperties.event == event_properties.event,
        ).upsert(
            Set(
                {
                    ClickStreamEventProperties.properties: event_properties.properties,
                    ClickStreamEventProperties.updated_at: datetime.utcnow(),
                }
            ),
            on_insert=event_properties,
        )

        return event_properties
