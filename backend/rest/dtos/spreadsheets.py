from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel

from domain.spreadsheets.models import (
    AIQuery,
    ComputedSpreadsheet,
    DimensionDefinition,
    MetricDefinition,
    SpreadSheetColumn,
    SpreadsheetType,
    SubHeaderColumn,
    WordReplacement,
    WorkBook,
)
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse


class TransientSpreadsheetsDto(BaseModel):
    datasourceId: str
    query: str
    is_sql: bool = False
    ai_query: Optional[AIQuery]


class TransientExpressionDto(BaseModel):
    datasourceId: str
    expression: str
    variables: dict
    table: str
    database: str


class TransientSpreadsheetColumnDto(BaseModel):
    datasourceId: str
    dimensions: List[DimensionDefinition]
    metrics: List[MetricDefinition]
    database: str
    table: str


class ComputedSpreadsheetQueryResponse(ComputedSpreadsheet, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class SpreadSheetDto(BaseModel):
    name: str
    headers: List[SpreadSheetColumn]
    subHeaders: List[SubHeaderColumn]
    is_sql: bool
    query: str
    edit_mode: bool
    sheet_type: SpreadsheetType
    meta: dict
    ai_query: Optional[AIQuery]


class CreateWorkBookDto(BaseModel):
    name: str
    spreadsheets: List[SpreadSheetDto]
    datasourceId: str


class WorkBookResponse(WorkBook, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class WorkbookWithUser(WorkBook, ModelResponse):
    user: Optional[AppertureUserResponse]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class SavedWorkBookResponse(WorkBook, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class ComputePivotDto(BaseModel):
    dsId: PydanticObjectId
    sql: str
    rows: List[str]
    columns: List[str]
    values: List[str]
