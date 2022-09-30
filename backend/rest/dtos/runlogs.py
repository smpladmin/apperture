from datetime import datetime
from domain.runlogs.models import RunLogStatus

from pydantic import BaseModel


class UpdateRunLogDto(BaseModel):
    datasource_id: str
    date: str
    status: RunLogStatus
