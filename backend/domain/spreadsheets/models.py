from enum import Enum
from typing import List, Optional, Union

from beanie import PydanticObjectId
from pydantic import BaseModel

from repositories.document import Document


class ColumnType(str, Enum):
    COMPUTED_HEADER = "COMPUTED_HEADER"
    QUERY_HEADER = "QUERY_HEADER"
    PADDING_HEADER = "PADDING_HEADER"


class SubHeaderColumnType(str, Enum):
    DIMENSION = ("DIMENSION",)
    METRIC = ("METRIC",)


class SpreadSheetColumn(BaseModel):
    name: str
    type: ColumnType


class SubHeaderColumn(BaseModel):
    name: str
    type: SubHeaderColumnType


class ComputedSpreadsheet(BaseModel):
    data: List[dict]
    headers: List[SpreadSheetColumn]


class Spreadsheet(BaseModel):
    name: str
    headers: List[SpreadSheetColumn]
    subHeaders: Optional[List[SubHeaderColumn]]
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
    COUNTIF = "countif"


class ColumnFilterOperators(str, Enum):
    EQUALS = "="
    NOT_EQUALS = "!="
    GREATER_THAN = ">"
    LESS_THAN = "<"
    GREATER_THAN_OR_EQUALS = ">="
    LESS_THAN_OR_EQUALS = "<="
    IN = "in"
    NOT_IN = "not in"
    CONTAINS = "contains"
    NOT_CONTAINS = "not contains"


class ColumnFilter(BaseModel):
    operator: ColumnFilterOperators
    operand: str
    value: Union[List[int], List[str]]


class MetricDefinition(BaseModel):
    formula: Formula
    filters: List[ColumnFilter] = []


class DimensionDefinition(BaseModel):
    formula: Formula
    property: Optional[str]
