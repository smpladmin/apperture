from typing import List, Optional, Optional
from beanie import PydanticObjectId

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
    ServerType,
)
from rest.dtos.datasources import DataSourceResponse

from .model_response import ModelResponse


class IntegrationResponse(Integration, ModelResponse):
    credential: Optional[Credential]
    datasource: Optional[DataSourceResponse]

    class Config:
        orm_mode = True


class IntergationResponseWithCredential(ModelResponse):
    id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    provider: IntegrationProvider
    credential: Optional[Credential]

    class Config:
        allow_population_by_field_name = True


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


class CdcCredentialDto(BaseModel):
    server: str
    port: str
    username: str
    password: str
    serverType: ServerType
    database: str
    tables: List[str]


class BranchCredentialDto(BaseModel):
    appId: str
    branchKey: str
    branchSecret: str


class CreateIntegrationDto(BaseModel):
    appId: str
    provider: IntegrationProvider
    accountId: Optional[str]
    apiKey: Optional[str]
    apiSecret: Optional[str]
    tableName: Optional[str]
    database: Optional[str]
    databaseCredential: Optional[DatabaseCredentialDto]
    csvFileId: Optional[str]
    eventList: Optional[List[str]]
    branchCredential: Optional[BranchCredentialDto]
    cdcCredential: Optional[CdcCredentialDto]
    tataIvrAuthToken: Optional[str]


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
