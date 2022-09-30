from datetime import datetime
from enum import Enum

from beanie import PydanticObjectId
from repositories import Document


class RunLogStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    STARTED = "started"
    FAILED = "failed"


class RunLog(Document):
    datasource_id: PydanticObjectId
    date: datetime
    status: RunLogStatus

    class Settings:
        name = "runlogs"
