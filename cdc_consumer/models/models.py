from enum import Enum
from typing import List, Union

from pydantic import BaseModel


class IntegrationProvider(str, Enum):
    MYSQL = "mysql"
    MSSQL = "mssql"
    POSTGRESQL = "psql"
    CDC = "cdc"


class ClickHouseCredential(BaseModel):
    username: str
    password: str
    databasename: str


class CdcCredential(BaseModel):
    server: str
    port: str
    username: str
    password: str
    server_type: IntegrationProvider
    database: str
    tables: List[str]

    class Config:
        allow_population_by_field_name = True


class ClickHouseRemoteConnectionCred(BaseModel):
    host: str
    port: int
    username: str
    password: str


class CdcIntegration(BaseModel):
    id: str
    appId: str
    provider: IntegrationProvider
    cdcCredential: CdcCredential
    clickhouseCredential: ClickHouseCredential
    remoteConnection: Union[ClickHouseRemoteConnectionCred, None]
