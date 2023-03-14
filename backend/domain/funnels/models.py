import datetime
from enum import Enum
from beanie import PydanticObjectId
from typing import List, Optional, Union
from pydantic import BaseModel
from domain.common.date_models import DateFilterType, FixedDateFilter, LastDateFilter

from domain.segments.models import WhereSegmentFilter
from repositories.document import Document


class FunnelStep(BaseModel):
    event: str
    filters: Optional[List[WhereSegmentFilter]]


class Funnel(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    steps: List[FunnelStep]
    random_sequence: bool
    date_filter: Optional[Union[LastDateFilter, FixedDateFilter]]
    date_filter_type: Optional[DateFilterType]

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


class FunnelConversion(BaseModel):
    converted: FunnelConversionData
    dropped: FunnelConversionData
