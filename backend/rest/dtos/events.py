import datetime
from pydantic import BaseModel

from domain.common.models import IntegrationProvider


class CreateEventDto(BaseModel):
    datasourceId: str
    timestamp: datetime.datetime
    provider: IntegrationProvider
    userId: str
    eventName: str
    properties: dict
