from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional, NamedTuple


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"
    BRANCH = "BRANCH"
    FACEBOOK_ADS = "FACEBOOK_ADS"
    GOOGLE_ADS = "GOOGLE_ADS"
    MYSQL = "MYSQL"
    MSSQL = "MSSQL"
    CSV = "CSV"
    CDC = "CDC"


class BranchCredential(BaseModel):
    app_id: str
    branch_key: str
    branch_secret: str


class FacebookAdsCredential(BaseModel):
    account_ids: List[str]
    access_token: str


class DatabaseSSHCredential(BaseModel):
    server: str
    port: str
    username: Optional[str]
    password: Optional[str]
    ssh_key: Optional[str]


class MySQLCredential(BaseModel):
    host: str
    port: str
    username: str
    password: str
    databases: List[str]
    over_ssh: bool = False
    ssh_credential: Optional[DatabaseSSHCredential]


class MsSQLCredential(BaseModel):
    server: str
    port: str
    username: str
    password: str
    databases: List[str]
    over_ssh: bool = False
    ssh_credential: Optional[DatabaseSSHCredential]


class Credential(BaseModel):
    type: CredentialType
    account_id: Optional[str] = Field(alias="accountId")
    refresh_token: Optional[str] = Field(alias="refreshToken")
    api_key: Optional[str] = Field(alias="apiKey")
    tableName: Optional[str]
    secret: Optional[str]
    api_base_url: Optional[str] = Field(alias="apiBaseUrl")
    mssql_credential: Optional[MsSQLCredential] = Field(alias="mssqlCredential")
    mysql_credential: Optional[MySQLCredential] = Field(alias="mysqlCredential")
    branch_credential: Optional[BranchCredential] = Field(alias="branchCredential")
    facebook_ads_credential: Optional[FacebookAdsCredential] = Field(
        alias="facebookAdsCredential"
    )


class DataSourceVersion(str, Enum):
    V3 = "V3"
    V4 = "V4"
    DEFAULT = "DEFAULT"


class DatabaseClient(str, Enum):
    MYSQL = "mysql"
    CLICKHOUSE = "clickhouse"
    MSSQL = "mssql"


class IntegrationProvider(str, Enum):
    GOOGLE = "google"
    MIXPANEL = "mixpanel"
    AMPLITUDE = "amplitude"
    CLEVERTAP = "clevertap"
    APPERTURE = "apperture"
    API = "api"
    BRANCH = "branch"
    CDC = "cdc"
    FACEBOOK_ADS = "facebook_ads"
    GOOGLE_ADS = "google_ads"
    MYSQL = "mysql"
    MSSQL = "mssql"
    CSV = "csv"


class DataSource(BaseModel):
    id: str = Field(alias="_id")
    appId: str
    createdAt: datetime
    provider: IntegrationProvider
    name: Optional[str]
    external_source_id: Optional[str] = Field(alias="externalSourceId")
    version: DataSourceVersion


class DataSourceResponse(BaseModel):
    datasource: DataSource
    credential: Credential


class CreateEvent(NamedTuple):
    datasourceId: str
    timestamp: datetime
    provider: IntegrationProvider
    userId: str
    eventName: str
    properties: dict


class ClickHouseRemoteConnectionCred(BaseModel):
    host: str
    port: int
    username: str
    password: str


class ClickHouseCredential(BaseModel):
    username: str
    password: str
    databasename: str


class AppDatabaseResponse(BaseModel):
    name: str
    database_credentials: ClickHouseCredential
