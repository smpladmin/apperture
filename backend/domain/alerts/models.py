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
    TABLE_FREQUENCY = "table_frequency"


class ChannelType(str, Enum):
    SLACK = "slack"
    EMAIL = "email"


class SlackChannel(BaseModel):
    type: ChannelType
    slack_channel: str
    slack_url: str


class EmailChannel(BaseModel):
    type: ChannelType
    emails: List[str]


class ThresholdType(str, Enum):
    PERCENTAGE = "percentage"
    ABSOLUTE = "absolute"


class Threshold(BaseModel):
    type: ThresholdType
    value: int


class FrequencyAlertMeta(BaseModel):
    last_n_minutes: int
    timestamp_column: str
    sleep_hours_start: Optional[int]
    sleep_hours_end: Optional[int]


class Alert(Document):
    datasource_id: PydanticObjectId
    user_id: PydanticObjectId
    type: AlertType
    threshold: Optional[Threshold]
    schedule: Optional[Schedule]
    table: Optional[str]
    frequency_alert: Optional[FrequencyAlertMeta]
    channel: Union[SlackChannel, EmailChannel]
    enabled: bool = True

    class Settings:
        name = "alerts"
