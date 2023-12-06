from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TimeUnit(str, Enum):
    MINUTES = "minutes"
    HOURS = "hours"
    DAYS = "days"


class UpdateFrequency(BaseModel):
    interval: int
    unit: TimeUnit


class Spreadsheet(BaseModel):
    id: str
    name: str


class GoogleSheet(BaseModel):
    enable_sheet_push: bool
    spreadsheet: Spreadsheet
    sheet_range: str


class APICredential(BaseModel):
    url: str
    headers: str


class Datamart(BaseModel):
    id: str = Field(alias="_id")
    datasource_id: str = Field(alias="datasourceId")
    app_id: str = Field(alias="appId")
    name: str
    table_name: str = Field(alias="tableName")
    query: str
    enabled: bool
    update_frequency: Optional[UpdateFrequency] = Field(alias="updateFrequency")
    google_sheet: Optional[GoogleSheet] = Field(alias="googleSheet")
    api_credential: Optional[APICredential] = Field(alias="apiCredential")
    created_at: datetime = Field(alias="createdAt")
