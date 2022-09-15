from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from domain.cleaned_data.models import CleanedData
from rest.dtos.model_response import ModelResponse


class CreateCleanedDataDto(BaseModel):
    previousEvent: str
    currentEvent: str
    users: int
    hits: int
    date: str


class CreateCleanedDataRowsDto(BaseModel):
    datasourceId: str
    provider: IntegrationProvider
    rows: list[CreateCleanedDataDto]


class CleanedDataResponse(CleanedData, ModelResponse):
    pass