from domain.runlogs.models import RunLogStatus

from pydantic import BaseModel


class CreateRunLogDto(BaseModel):
    datasource_id: str
    date: str
    status: RunLogStatus
