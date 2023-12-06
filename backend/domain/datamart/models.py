import datetime
from enum import Enum
from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from repositories import Document


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
    enable_sheet_push: bool = False
    spreadsheet: Spreadsheet
    sheet_range: str


class APICredential(BaseModel):
    url: str
    headers: str


class DataMart(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    table_name: str
    last_refreshed: datetime.datetime
    query: str
    enabled: bool = True
    refresh_token: Optional[str] = Field(hidden=True)
    google_sheet: Optional[GoogleSheet]
    update_frequency: Optional[UpdateFrequency]
    api_credential: Optional[APICredential]

    class Settings:
        name = "datamart"
