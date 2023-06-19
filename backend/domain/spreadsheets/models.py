from enum import Enum
from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel

from repositories.document import Document


class ColumnType(str, Enum):
    COMPUTED_HEADER = "COMPUTED_HEADER"
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
    query: str


class WorkBook(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    spreadsheets: List[Spreadsheet]
    enabled: bool = True

    class Settings:
        name = "workbooks"


class Formula(str, Enum):
    COUNT = "count"
    UNIQUE = "unique"


class ColumnDefinitionType(str, Enum):
    DIMENSION = "dimension"
    METRIC = "metric"


class ColumnDefinition(BaseModel):
    formula: Formula
    property: Optional[str]
    type: ColumnDefinitionType
