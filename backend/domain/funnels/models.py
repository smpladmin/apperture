import datetime
from enum import Enum
from beanie import PydanticObjectId
from typing import List, Optional, Union
from pydantic import BaseModel
from domain.common.date_models import DateFilter

from domain.segments.models import WhereSegmentFilter
from repositories.document import Document


class FunnelStep(BaseModel):
    event: str
    filters: Optional[List[WhereSegmentFilter]]


class ConversionWindowType(Enum):
    SECONDS = "seconds"
    MINUTES = "minutes"
    HOURS = "hours"
    DAYS = "days"
    WEEKS = "weeks"
    MONTHS = "months"
    SESSIONS = "sessions"

    def get_multiplier(self):
        return {
            self.SECONDS: 1,
            self.MINUTES: 60,
            self.HOURS: 60 * 60,
            self.DAYS: 24 * 60 * 60,
            self.WEEKS: 7 * 24 * 60 * 60,
            self.MONTHS: 30 * 24 * 60 * 60,
        }.get(self, 1)


class ConversionWindow(BaseModel):
    type: ConversionWindowType
    value: Union[int, None]


class Funnel(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    steps: List[FunnelStep]
    random_sequence: bool
    date_filter: Optional[DateFilter]
    conversion_window: Optional[ConversionWindow]
    enabled: bool = True

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
