from datetime import datetime
from domain.runlogs.models import RunLogStatus

from pydantic import BaseModel


class CreateRunLogDto(BaseModel):
    datasource_id: str
    date: datetime
    status: RunLogStatus
