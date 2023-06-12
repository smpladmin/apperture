from typing import List

from pydantic import BaseModel

from domain.clickstream_event_properties.models import ClickStreamEventProperties
from rest.dtos.model_response import ModelResponse


class ClickStreamEventPropertiesDto(BaseModel):
    event: str
    properties: List[str]


class ClickStreamEventPropertiesResponse(ClickStreamEventProperties, ModelResponse):
    class Config:
        allow_population_by_field_name = True
