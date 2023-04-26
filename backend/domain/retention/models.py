import datetime
from enum import Enum
from typing import Optional, List

from beanie import PydanticObjectId
from pydantic import BaseModel

from domain.common.date_models import DateFilter
from domain.metrics.models import SegmentFilter
from domain.segments.models import WhereSegmentFilter
from repositories import Document


class EventSelection(BaseModel):
    event: str
    filters: Optional[List[WhereSegmentFilter]]


class Granularity(str, Enum):
    DAYS = "days"
    WEEKS = "weeks"
    MONTHS = "months"

    def get_days(self):
        return {
            self.DAYS: 1,
            self.WEEKS: 7,
            self.MONTHS: 30,
        }.get(self, 1)


class Retention(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    start_event: EventSelection
    goal_event: EventSelection
    date_filter: DateFilter
    segment_filter: Optional[SegmentFilter]
    granularity: Granularity
    enabled: bool = True

    class Settings:
        name = "retention"


class ComputedRetentionTrend(BaseModel):
    granularity: datetime.datetime
    retention_rate: float
    retained_users: int


class ComputedRetentionForInterval(BaseModel):
    name: str
    value: float


class ComputedRetention(BaseModel):
    count: int
    data: List[ComputedRetentionForInterval]
