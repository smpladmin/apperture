from typing import List
from pydantic import BaseModel

from domain.funnels.models import (
    FunnelStep,
    Funnel,
    ComputedFunnelStep,
    ComputedFunnel,
    FunnelTrendsData,
    FunnelConversionData,
)
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
