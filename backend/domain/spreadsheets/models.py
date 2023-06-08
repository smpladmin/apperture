from enum import Enum
from typing import List

from beanie import PydanticObjectId
from pydantic import BaseModel

from repositories.document import Document


class ColumnType(str, Enum):
    COMPUTED = "COMPUTED"
    QUERY_HEADER = "QUERY_HEADER"


class SpreadSheetColumn(BaseModel):
    name: str
    type: ColumnType


class ComputedSpreadsheet(BaseModel):
    data: List[dict]
    headers: List[SpreadSheetColumn]


class Spreadsheet(BaseModel):
    name: str
    headers: List[SpreadSheetColumn]
    is_sql: bool
    base_query: str


class WorkBook(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    spreadsheets: List[Spreadsheet]
    enabled: bool = True

    class Settings:
        name = "workbooks"
