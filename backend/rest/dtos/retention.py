from typing import Optional

from beanie import PydanticObjectId
from pydantic import BaseModel

from domain.common.date_models import DateFilter
from domain.common.filter_models import EventSelection
from domain.metrics.models import SegmentFilter
from domain.retention.models import TrendScale, Granularity, ComputedRetentionTrend
from rest.dtos.model_response import ModelResponse


class TransientRetentionDto(BaseModel):
    datasourceId: PydanticObjectId
    startEvent: EventSelection
    goalEvent: EventSelection
    dateFilter: DateFilter
    segmentFilter: Optional[SegmentFilter]
    trendScale: TrendScale
    granularity: Granularity
    interval: int


class ComputedRetentionTrendResponse(ComputedRetentionTrend, ModelResponse):
    class Config:
        allow_population_by_field_name = True
