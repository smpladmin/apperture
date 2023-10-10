from typing import List
from pydantic import BaseModel
from domain.spreadsheets.models import ComputedSpreadsheet

from rest.dtos.model_response import ModelResponse


class TransientGoogleSheetsDto(BaseModel):
    query: str


class ComputedTransientSpreadsheetResponse(ComputedSpreadsheet, ModelResponse):
    class Config:
        allow_population_by_field_name = True
