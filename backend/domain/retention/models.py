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

class TrendScale(str, Enum):
    ABSOLUTE = "absolute"
    PERCENTAGE = "percentage"


class Granularity(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"


class Retention(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    start_event: EventSelection
    goal_event: EventSelection
    date_filter: DateFilter
    segment_filter: Optional[SegmentFilter]
    trend_scale: TrendScale
    granularity: Granularity


class ComputedRetentionTrend(BaseModel):
    granularity: datetime.datetime
    retention_rate: float
