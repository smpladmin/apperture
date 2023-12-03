import datetime
from typing import Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from repositories import Document


class GoogleSheet(BaseModel):
    refresh_token: str = Field(hidden=True)
    enable_sheet_push: bool
    spreadsheet_id: str
    sheet_range: str


class DataMart(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    table_name: str
    last_refreshed: datetime.datetime
    query: str
    enabled: bool = True
    google_sheet: Optional[GoogleSheet]
    frequency: Optional[int]

    class Settings:
        name = "datamart"
