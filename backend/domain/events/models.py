import datetime
from typing import List

from pydantic import BaseModel
from domain.common.models import IntegrationProvider


class Event(BaseModel):
    name: str
    timestamp: datetime.datetime
    user_id: str
    provider: IntegrationProvider


class EventsData(BaseModel):
    count: int
    data: List[Event]
