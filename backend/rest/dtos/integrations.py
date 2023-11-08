from typing import List, Optional, Union

from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from domain.integrations.models import (
    Credential,
    CredentialType,
    CSVCredential,
    Integration,
    MsSQLCredential,
    MySQLCredential,
    RelationalDatabaseType,
)
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


class DatabaseCredentialDto(BaseModel):
    host: str
    port: str
    username: str
    password: str
    databases: List[str]
    overSsh: bool = False
    databaseType: RelationalDatabaseType = RelationalDatabaseType.MYSQL
    sshCredential: Optional[DatabaseSSHCredentialDto]


class CreateIntegrationDto(BaseModel):
    appId: str
    provider: IntegrationProvider
    accountId: Union[str, None]
    apiKey: Union[str, None]
    apiSecret: Union[str, None]
    tableName: Union[str, None]
    database: Union[str, None]
    databaseCredential: Union[DatabaseCredentialDto, None]
    csvFileId: Union[str, None]
    eventList: Union[List[str], None]


class IntegrationWithDataSources(Integration, ModelResponse):
    credential: Optional[Credential]
    datasources: list[DataSourceResponse] = []

    class Config:
        orm_mode = True


class CSVCreateDto(BaseModel):
    fileId: str
    datasourceId: str


class DeleteCSVDto(BaseModel):
    appId: str
    filename: str


class CredentialDto(BaseModel):
    type: Optional[CredentialType]
    account_id: Optional[str]
    refresh_token: Optional[str]
    api_key: Optional[str]
    secret: Optional[str]
    tableName: Optional[str]
    mysql_credential: Optional[MySQLCredential]
    mssql_credential: Optional[MsSQLCredential]
    csv_credential: Optional[CSVCredential]
    api_base_url: Optional[str]
