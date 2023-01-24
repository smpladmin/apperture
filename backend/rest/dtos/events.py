import datetime
from typing import NamedTuple
from domain.events.models import EventsData


from domain.common.models import IntegrationProvider
from rest.dtos.model_response import ModelResponse


class CreateEventDto(NamedTuple):
    datasourceId: str
    timestamp: datetime.datetime
    provider: IntegrationProvider
    userId: str
    eventName: str
    properties: dict


class EventsResponse(EventsData, ModelResponse):
    class Config:
        allow_population_by_field_name = True
