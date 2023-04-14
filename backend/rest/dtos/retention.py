from typing import Optional

from beanie import PydanticObjectId
from pydantic import BaseModel

from domain.common.date_models import DateFilter
from domain.retention.models import EventSelection, Retention
from domain.metrics.models import SegmentFilter
from domain.retention.models import Granularity, ComputedRetentionTrend
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse


class TransientRetentionTrendDto(BaseModel):
    datasourceId: PydanticObjectId
    startEvent: EventSelection
    goalEvent: EventSelection
    dateFilter: DateFilter
    segmentFilter: Optional[SegmentFilter]
    granularity: Granularity
    interval: int


class TransientRetentionDto(BaseModel):
    datasourceId: PydanticObjectId
    startEvent: EventSelection
    goalEvent: EventSelection
    dateFilter: DateFilter
    segmentFilter: Optional[SegmentFilter]
    granularity: Granularity


class CreateRetentionDto(BaseModel):
    datasourceId: PydanticObjectId
    startEvent: EventSelection
    goalEvent: EventSelection
    name: str
    dateFilter: DateFilter
    segmentFilter: Optional[SegmentFilter]
    granularity: Granularity


class ComputedRetentionTrendResponse(ComputedRetentionTrend, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class RetentionResponse(Retention, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class RetentionWithUser(Retention, ModelResponse):
    user: Optional[AppertureUserResponse]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
