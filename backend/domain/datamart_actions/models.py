from repositories import Document
from pydantic import BaseModel
from beanie import PydanticObjectId

from enum import Enum
from typing import Optional, Union


class ActionType(str, Enum):
    TABLE = "table"
    GOOGLE_SHEET = "google_sheet"
    API = "api"
    SLACK = "slack"
    EMAIL = "email"


class Frequency(str, Enum):
    QUARTER_HOURLY = "quarter_hourly"
    HALF_HOURLY = "half_hourly"
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


class TableMeta(BaseModel):
    name: str


class APIMeta(BaseModel):
    url: str
    headers: str


class Spreadsheet(BaseModel):
    id: str
    name: str


class GoogleSheetMeta(BaseModel):
    spreadsheet: Spreadsheet
    sheet: str


class DatamartAction(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    datamart_id: PydanticObjectId
    type: ActionType
    schedule: Schedule
    meta: Union[GoogleSheetMeta, APIMeta, TableMeta]
    enabled: bool = True

    class Settings:
        name = "datamart_actions"
