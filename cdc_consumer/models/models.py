from enum import Enum
from typing import List

from pydantic import BaseModel


class IntegrationProvider(str, Enum):
    MYSQL = "mysql"
    MSSQL = "mssql"
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


class CdcIntegration(BaseModel):
    id: str
    appId: str
    provider: IntegrationProvider
    cdcCredential: CdcCredential
    clickhouseCredential: ClickHouseCredential


class ClickHouseRemoteConnectionCred(BaseModel):
    host: str
    port: int
    username: str
    password: str
