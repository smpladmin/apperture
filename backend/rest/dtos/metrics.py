from typing import List, Optional, Union
from beanie import PydanticObjectId
from pydantic import BaseModel
from domain.common.date_models import DateFilterType, FixedDateFilter, LastDateFilter
from rest.dtos.apperture_users import AppertureUserResponse

from rest.dtos.model_response import ModelResponse
from domain.metrics.models import (
    SegmentsAndEvents,
    Metric,
    ComputedMetricStep,
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
    dateFilter: Optional[Union[LastDateFilter, FixedDateFilter]]
    dateFilterType: Optional[DateFilterType]


class CreateMetricDTO(BaseModel):
    datasourceId: PydanticObjectId
    name: str
    function: str
    aggregates: List[SegmentsAndEvents]
    breakdown: List[str]
    dateFilter: Optional[Union[LastDateFilter, FixedDateFilter]]
    dateFilterType: Optional[DateFilterType]


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
