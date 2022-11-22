import datetime

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
    event: str
    users: int
    conversion: float


class ComputedFunnel(BaseModel):
    datasource_id: PydanticObjectId
    name: str
    steps: List[FunnelStep]
    random_sequence: bool
    computed_funnel: List[ComputedFunnelStep]


class FunnelTrendsData(BaseModel):
    conversion: str
    start_date: datetime.datetime
    end_date: datetime.datetime
