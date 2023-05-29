from pydantic import BaseModel
from domain.spreadsheets.models import ComputedSpreadsheet
from rest.dtos.model_response import ModelResponse


class TransientSpreadsheetsDto(BaseModel):
    datasourceId: str
    query: str


class ComputedSpreadsheetQueryResponse(ComputedSpreadsheet, ModelResponse):
    class Config:
        allow_population_by_field_name = True
