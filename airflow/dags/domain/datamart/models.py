import datetime
from typing import Optional

from pydantic import BaseModel, Field


class GoogleSheet(BaseModel):
    refresh_token: str
    enable_sheet_push: bool
    spreadsheet_id: str
    sheet_range: str


class Datamart(BaseModel):
    id: str = Field(alias="_id")
    datasourceId: str
    appId: str
    userId: str
    name: str
    tableName: str
    lastRefreshed: datetime.datetime
    query: str
    enabled: bool
    frequency: Optional[int]
    googleSheet: Optional[GoogleSheet]
    createdAt: datetime.datetime
