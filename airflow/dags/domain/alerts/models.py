from pydantic import BaseModel, Field

from enum import Enum
from datetime import datetime
from typing import List, Optional, Union

from domain.datamart.models import Schedule
from domain.datasource.models import (
    ClickHouseCredential,
    ClickHouseRemoteConnectionCred,
)


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


class Alert(BaseModel):
    id: str = Field(alias="_id")
    datasourceId: str
    createdAt: datetime
    table: Optional[str]
    type: AlertType
    threshold: Threshold
    frequencyAlert: Optional[FrequencyAlertMeta]
    schedule: Optional[Schedule]
    channel: Union[SlackChannel, EmailChannel]
    enabled: bool = True


class IntegrationProvider(str, Enum):
    MYSQL = "mysql"
    MSSQL = "mssql"
    POSTGRESQL = "psql"
    CDC = "cdc"


class CdcCredential(BaseModel):
    server: str
    port: str
    username: str
    password: str
    server_type: IntegrationProvider
    database: str
    tables: List[str]

    class Config:
        allow_population_by_field_name = True


class CdcIntegration(BaseModel):
    id: str
    appId: str
    provider: IntegrationProvider
    cdcCredential: CdcCredential
    clickhouseCredential: ClickHouseCredential
    remoteConnection: Union[ClickHouseRemoteConnectionCred, None]
