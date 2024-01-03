from repositories import Document
from pydantic import BaseModel
from beanie import PydanticObjectId

from enum import Enum
from typing import List, Optional, Union

from domain.datamart_actions.models import Schedule


class AlertType(str, Enum):
    CDC_ERROR = "cdc_error"
    CDC_DB_COUNT = "cdc_db_count"
    CDC_TABLE_COUNT = "cdc_table_count"


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
    table: Optional[str]
    channel: Union[SlackChannel, EmailChannel]
    enabled: bool = True

    class Settings:
        name = "alerts"
