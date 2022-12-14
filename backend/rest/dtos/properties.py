from rest.dtos.model_response import ModelResponse
from domain.properties.models import Properties


class PropertiesResponse(Properties, ModelResponse):
    class Config:
        allow_population_by_field_name = True
