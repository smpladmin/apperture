from typing import List, Optional
from pydantic import BaseModel

from domain.funnels.models import (
    FunnelStep,
    Funnel,
    ComputedFunnelStep,
    ComputedFunnel,
    FunnelTrendsData,
    FunnelConversion,
)
from rest.dtos.appperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse


class CreateFunnelDto(BaseModel):
    datasourceId: str
    name: str
    steps: List[FunnelStep]
    randomSequence: bool


class TransientFunnelDto(BaseModel):
    datasourceId: str
    steps: List[FunnelStep]


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


class FunnelConversionResponseBody(FunnelConversion, ModelResponse):
    class Config:
        allow_population_by_field_name = True
