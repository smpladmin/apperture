import datetime
from typing import NamedTuple
from pydantic import BaseModel
from domain.events.models import PaginatedEventsData
from domain.common.models import IntegrationProvider
from rest.dtos.model_response import ModelResponse


class CreateAPIDataDto(NamedTuple):
    create_time: datetime.datetime
    datasource_id: str
    properties: dict


class APIDataResponse(PaginatedEventsData, ModelResponse):
    class Config:
        allow_population_by_field_name = True
