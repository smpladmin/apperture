from beanie import PydanticObjectId
from pydantic import BaseModel

from rest.dtos.model_response import ModelResponse
from domain.metrics.models import ComputedMetricResult,ComputeMetricRequest



class MetricsComputeResponse(ComputedMetricResult,ModelResponse):
    class Config:
        allow_population_by_field_name = True
    
class MetricsComputeDto(ComputeMetricRequest,BaseModel):
    class Config:
        allow_population_by_field_name = True