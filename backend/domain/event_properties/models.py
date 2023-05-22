from typing import List
from beanie import PydanticObjectId

from domain.common.models import IntegrationProvider, Property
from repositories import Document


class EventProperties(Document):
    datasource_id: PydanticObjectId
    event: str
    properties: List[Property]
    provider: IntegrationProvider

    class Settings:
        name = "event_properties"
