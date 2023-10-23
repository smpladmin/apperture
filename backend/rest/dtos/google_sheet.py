from typing import List, Optional
from pydantic import BaseModel
from domain.google_sheet.models import SheetQuery
from domain.spreadsheets.models import ComputedSpreadsheet

from rest.dtos.model_response import ModelResponse

from domain.spreadsheets.models import WordReplacement


class TableData(BaseModel):
    tableName: str
    wordReplacements: List[WordReplacement]


class TransientGoogleSheetsDto(BaseModel):
    query: str
    isSql: bool = True
    tableData: Optional[TableData]


class ComputedTransientSpreadsheetResponse(ComputedSpreadsheet, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class CreateSheetQueryDto(BaseModel):
    name: str
    query: str
    spreadsheetId: str
    chats: List[dict]
    sheetReference: dict


class SheetQueryResponse(SheetQuery, ModelResponse):
    class Config:
        allow_population_by_field_name = True
