from typing import List

from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from domain.event_properties.models import EventProperties
from rest.dtos.model_response import ModelResponse


class EventPropertiesDto(BaseModel):
    event: str
    properties: List[str]
    provider: IntegrationProvider


class EventPropertiesResponse(EventProperties, ModelResponse):
    class Config:
        allow_population_by_field_name = True
