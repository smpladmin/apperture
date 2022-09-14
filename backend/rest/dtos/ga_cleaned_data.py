from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from domain.ga_cleaned_data.models import GACleanedData
from rest.dtos.model_response import ModelResponse


class CreateGACleanedDataDto(BaseModel):
    previousEvent: str
    currentEvent: str
    users: int
    hits: int
    date: str


class CreateGACleanedDataRowsDto(BaseModel):
    datasourceId: str
    provider: IntegrationProvider
    rows: list[CreateGACleanedDataDto]


class GACleanedDataResponse(GACleanedData, ModelResponse):
    pass