from typing import Optional

from pydantic import BaseModel
from domain.common.models import IntegrationProvider
from domain.integrations.models import Credential, Integration
from rest.dtos.datasources import DataSourceResponse
from .model_response import ModelResponse


class IntegrationResponse(Integration, ModelResponse):
    credential: Optional[Credential]
    datasource: Optional[DataSourceResponse]

    class Config:
        orm_mode = True


class CreateIntegrationDto(BaseModel):
    appId: str
    provider: IntegrationProvider
    accountId: str
    apiKey: str
    apiSecret: str
