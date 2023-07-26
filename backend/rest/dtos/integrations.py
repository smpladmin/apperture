from typing import Optional, Union

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


class DatabaseSSHCredentialDto(BaseModel):
    server: str
    port: str
    username: Optional[str]
    password: Optional[str]
    sshKey: Optional[str]


class MySQLCredentialDto(BaseModel):
    host: str
    port: str
    username: str
    password: str
    overSsh: bool = False
    sshCredential: Optional[DatabaseSSHCredentialDto]


class CreateIntegrationDto(BaseModel):
    appId: str
    provider: IntegrationProvider
    accountId: Union[str, None]
    apiKey: Union[str, None]
    apiSecret: Union[str, None]
    tableName: Union[str, None]
    database: Union[str, None]
    mySQLCredential: Union[MySQLCredentialDto, None]
    csvFileId: Union[str, None]


class IntegrationWithDataSources(Integration, ModelResponse):
    credential: Optional[Credential]
    datasources: list[DataSourceResponse] = []

    class Config:
        orm_mode = True


class TestMySQLConnectionDto(BaseModel):
    host: str
    port: str
    username: str
    password: str
    overSsh: bool = False
    sshCredential: Optional[DatabaseSSHCredentialDto]


class CSVCreateDto(BaseModel):
    fileId: str
    datasourceId: str


class DeleteCSVDto(BaseModel):
    appId: str
    filename: str
