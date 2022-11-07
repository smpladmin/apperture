import datetime
from pydantic import BaseModel

from domain.common.models import IntegrationProvider


class CreateEventDto(BaseModel):
    datasourceId: str
    timestamp: datetime.datetime
    provider: IntegrationProvider
    event_name: str
    properties: dict
