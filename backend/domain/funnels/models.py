import datetime
from enum import Enum
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
    app_id: PydanticObjectId
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
    conversion: float
    first_step_users: int
    last_step_users: int
    start_date: datetime.datetime
    end_date: datetime.datetime


class FunnelEventUserData(BaseModel):
    id: str


class ConversionStatus(str, Enum):
    CONVERTED = "converted"
    DROPPED = "dropped"


class FunnelConversionData(BaseModel):
    users: List[FunnelEventUserData]
    total_users: int
    unique_users: int


class FunnelConversionResponse(BaseModel):
    converted: FunnelConversionData
    dropped: FunnelConversionData
