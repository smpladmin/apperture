from datetime import datetime
from enum import Enum

from beanie import PydanticObjectId
from pydantic import BaseModel
from repositories import Document


class RunLogStatus(str, Enum):
    SCHEDULED = "scheduled"
    RESCHEDULED = "rescheduled"
    COMPLETED = "completed"
    STARTED = "started"
    FAILED = "failed"


class RunLog(Document):
    datasource_id: PydanticObjectId
    date: datetime
    status: RunLogStatus

    class Settings:
        name = "runlogs"


class DummyRunLog(BaseModel):
    datasource_id: PydanticObjectId
    date: datetime
    status: RunLogStatus
