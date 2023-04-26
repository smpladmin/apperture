from typing import List, Optional, Union

from pydantic import BaseModel

from domain.funnels.models import (
    ComputedFunnel,
    ComputedFunnelStep,
    ConversionStatus,
    ConversionWindow,
    DateFilter,
    Funnel,
    FunnelConversionData,
    FunnelStep,
    FunnelTrendsData,
)
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse


class CreateFunnelDto(BaseModel):
    datasourceId: str
    name: str
    steps: List[FunnelStep]
    randomSequence: bool
    dateFilter: Optional[DateFilter]
    conversionWindow: Optional[ConversionWindow]


class TransientFunnelConversionlDto(BaseModel):
    datasourceId: str
    steps: List[FunnelStep]
    status: ConversionStatus
    dateFilter: Optional[DateFilter]
    conversionWindow: Optional[ConversionWindow]
    randomSequence: bool


class TransientFunnelDto(BaseModel):
    datasourceId: str
    steps: List[FunnelStep]
    dateFilter: Optional[DateFilter]
    conversionWindow: Optional[ConversionWindow]
    randomSequence: Optional[bool]


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
