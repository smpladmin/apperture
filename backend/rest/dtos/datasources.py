from typing import List
from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from domain.datasources.models import DataSource, DataSourceVersion
from domain.integrations.models import Credential
from rest.dtos.model_response import ModelResponse


class DataSourceResponse(DataSource, ModelResponse):
    pass

    class Config:
        orm_mode = True


class CreateDataSourceDto(BaseModel):
    externalSourceId: str
    name: str
    version: DataSourceVersion


class CredentialResponse(Credential, ModelResponse):
    pass


class PrivateDataSourceResponse(BaseModel):
    datasource: DataSourceResponse
    credential: CredentialResponse


class DiffEventIngestionDto(BaseModel):
    events: List[str]
    start_date: str
    end_date: str
