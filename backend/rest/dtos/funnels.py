from typing import List, Optional, Union
from pydantic import BaseModel

from domain.funnels.models import (
    FunnelStep,
    Funnel,
    ComputedFunnelStep,
    ComputedFunnel,
    FunnelTrendsData,
    FunnelConversionData,
    ConversionStatus,
    DateFilterType,
    FixedDateFilter,
    LastDateFilter,
    ConversionWindow,
)
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse


class CreateFunnelDto(BaseModel):
    datasourceId: str
    name: str
    steps: List[FunnelStep]
    randomSequence: bool
    dateFilter: Optional[Union[LastDateFilter, FixedDateFilter]]
    dateFilterType: Optional[DateFilterType]
    conversionWindow: Optional[ConversionWindow]


class TransientFunnelConversionlDto(BaseModel):
    datasourceId: str
    steps: List[FunnelStep]
    status: ConversionStatus
    dateFilter: Optional[Union[LastDateFilter, FixedDateFilter]]
    dateFilterType: Optional[DateFilterType]
    conversionWindow: Optional[ConversionWindow]


class TransientFunnelDto(BaseModel):
    datasourceId: str
    steps: List[FunnelStep]
    dateFilter: Optional[Union[LastDateFilter, FixedDateFilter]]
    dateFilterType: Optional[DateFilterType]
    conversionWindow: Optional[ConversionWindow]


class FunnelResponse(Funnel, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class FunnelWithUser(Funnel, ModelResponse):
    user: Optional[AppertureUserResponse]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class ComputedFunnelStepResponse(ComputedFunnelStep, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class ComputedFunnelResponse(ComputedFunnel, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class FunnelTrendResponse(FunnelTrendsData, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class FunnelConversionResponseBody(FunnelConversionData, ModelResponse):
    class Config:
        allow_population_by_field_name = True
