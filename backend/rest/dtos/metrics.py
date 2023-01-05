from typing import List, Optional
from beanie import PydanticObjectId
from pydantic import BaseModel

from rest.dtos.model_response import ModelResponse
from domain.metrics.models import ComputedMetricResult, SegmentsAndEvents


class MetricsComputeResponse(ComputedMetricResult, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class MetricsComputeDto(BaseModel):
    class Config:
        allow_population_by_field_name = True

    datasourceId: PydanticObjectId
    function: str
    aggregates: List[SegmentsAndEvents]
    breakdown: List[str]
    startDate: Optional[str] 
    endDate: Optional[str] 
