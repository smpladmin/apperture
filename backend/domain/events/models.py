import datetime

from pydantic import BaseModel
from domain.common.models import IntegrationProvider


class Event(BaseModel):
    name: str
    timestamp: datetime.datetime
    user_id: str
    provider: IntegrationProvider
