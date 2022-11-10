from beanie import PydanticObjectId
from typing import List, Optional
from pydantic import BaseModel

from repositories.document import Document


class EventFilters(BaseModel):
    property: str
    value: str


class FunnelStep(BaseModel):
    event: str
    filters: Optional[List[EventFilters]]


class Funnel(Document):
    datasource_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    steps: List[FunnelStep]
    random_sequence: bool

    class Settings:
        name = "funnels"


class ComputedFunnelStep(BaseModel):
    event_name: str
    users: int
    conversion: float
