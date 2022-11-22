import datetime
from typing import NamedTuple


from domain.common.models import IntegrationProvider


class CreateEventDto(NamedTuple):
    datasourceId: str
    timestamp: datetime.datetime
    provider: IntegrationProvider
    userId: str
    eventName: str
    properties: dict
