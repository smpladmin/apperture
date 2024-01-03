from repositories import Document
from pydantic import BaseModel
from beanie import PydanticObjectId

from enum import Enum
from typing import List, Optional, Union


class AlertType(str, Enum):
    CDC_ERROR = "cdc_error"


class Frequency(str, Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class Schedule(BaseModel):
    time: Optional[str]
    period: Optional[str]
    date: Optional[str]
    day: Optional[str]
    frequency: Frequency


class SlackChannel(BaseModel):
    type: str
    slack_channel: str
    slack_url: str


class EmailChannel(BaseModel):
    type: str
    emails: List[str]


class Alert(Document):
    datasource_id: PydanticObjectId
    type: AlertType
    schedule: Optional[Schedule]
    channel: Union[SlackChannel, EmailChannel]
    enabled: bool = True

    class Settings:
        name = "alerts"
