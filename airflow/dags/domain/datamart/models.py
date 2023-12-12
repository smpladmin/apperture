from datetime import datetime
from enum import Enum
from typing import Optional, Union

from pydantic import BaseModel, Field


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


class DatamartActions(BaseModel):
    id: str = Field(alias="_id")
    datasource_id: str = Field(alias="datasourceId")
    app_id: str = Field(alias="appId")
    datamart_id: str = Field(alias="datamartId")
    type: ActionType
    schedule: Union[WeeklySchedule, MonthlySchedule, DailySchedule, HourlySchedule]
    meta: Union[GoogleSheetMeta, APIMeta, TableMeta]
    created_at: datetime = Field(alias="createdAt")
    enabled: bool
