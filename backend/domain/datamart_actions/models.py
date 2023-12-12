from repositories import Document
from pydantic import BaseModel
from beanie import PydanticObjectId

from enum import Enum
from typing import Union


class ActionType(str, Enum):
    TABLE = "table"
    GOOGLE_SHEET = "google_sheet"
    API = "api"
    SLACK = "slack"
    EMAIL = "email"


class Frequency(str, Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class HourlySchedule(BaseModel):
    frequency: Frequency


class DailySchedule(BaseModel):
    time: str
    period: str
    frequency: Frequency


class WeeklySchedule(BaseModel):
    time: str
    period: str
    day: str
    frequency: Frequency


class MonthlySchedule(BaseModel):
    time: str
    period: str
    date: str
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


class DatamartActions(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    datamart_id: PydanticObjectId
    type: ActionType
    schedule: Union[WeeklySchedule, MonthlySchedule, DailySchedule, HourlySchedule]
    meta: Union[GoogleSheetMeta, APIMeta, TableMeta]
    enabled: bool = True

    class Settings:
        name = "datamart_actions"
