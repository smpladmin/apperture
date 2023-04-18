from typing import List, Optional
from beanie import PydanticObjectId
from pydantic import BaseModel
from rest.dtos.apperture_users import AppertureUserResponse

from rest.dtos.model_response import ModelResponse
from domain.metrics.models import (
    SegmentsAndEvents,
    Metric,
    ComputedMetricStep,
    DateFilter,
    SegmentFilter,
)


class ComputedMetricStepResponse(ComputedMetricStep, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class MetricsComputeDto(BaseModel):
    class Config:
        allow_population_by_field_name = True

    datasourceId: PydanticObjectId
    function: str
    aggregates: List[SegmentsAndEvents]
    breakdown: List[str]
    dateFilter: Optional[DateFilter]
    segmentFilter: Optional[SegmentFilter]


class CreateMetricDTO(BaseModel):
    datasourceId: PydanticObjectId
    name: str
    function: str
    aggregates: List[SegmentsAndEvents]
    breakdown: List[str]
    dateFilter: Optional[DateFilter]
    segmentFilter: Optional[SegmentFilter]


class MetricFormulaDto(BaseModel):
    formula: str
    variableList: List[str]


class SavedMetricResponse(Metric, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class MetricWithUser(Metric, ModelResponse):
    user: Optional[AppertureUserResponse]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
