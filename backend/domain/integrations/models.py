from enum import Enum
from typing import Optional, List

from beanie import Indexed, PydanticObjectId
from pydantic import BaseModel, Field

from domain.common.models import IntegrationProvider
from repositories import Document


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"
    MYSQL = "MYSQL"
    MSSQL = "MSSQL"
    CSV = "CSV"
    BRANCH = "BRANCH"
    CDC = "CDC"
    FACEBOOK_ADS = "FACEBOOK_ADS"


class RelationalDatabaseType(str, Enum):
    MYSQL = "MYSQL"
    MSSQL = "MSSQL"


class DatabaseSSHCredential(BaseModel):
    server: str
    port: str
    username: Optional[str]
    password: Optional[str]
    ssh_key: Optional[str]

    class Config:
        allow_population_by_field_name = True


class CSVCredential(BaseModel):
    name: str
    s3_key: str
    table_name: str


class BranchCredential(BaseModel):
    app_id: str
    branch_key: str
    branch_secret: str


class FacebookAdsCredential(BaseModel):
    account_ids: List[str]
    access_token: str


class MySQLCredential(BaseModel):
    host: str
    port: str
    username: str
    password: str
    databases: List[str]
    over_ssh: bool = False
    ssh_credential: Optional[DatabaseSSHCredential]

    class Config:
        allow_population_by_field_name = True


class MsSQLCredential(BaseModel):
    server: str
    port: str
    username: str
    password: str
    databases: List[str]
    over_ssh: bool = False
    ssh_credential: Optional[DatabaseSSHCredential]

    class Config:
        allow_population_by_field_name = True


class ServerType(str, Enum):
    MYSQL = "mysql"
    MSSQL = "mssql"

    def get_connector_class(self):
        connector_class_dict = {
            self.MYSQL: "mysql.MySqlConnector",
            self.MSSQL: "sqlserver.SqlServerConnector",
        }
        return "io.debezium.connector." + connector_class_dict.get(
            self, "sqlserver.SqlServerConnector"
        )


class CdcCredential(BaseModel):
    server: str
    port: str
    username: str
    password: str
    server_type: ServerType
    database: str
    tables: List[str]

    class Config:
        allow_population_by_field_name = True


class Credential(BaseModel):
    type: CredentialType
    account_id: Optional[str]
    refresh_token: Optional[str]
    api_key: Optional[str]
    secret: Optional[str]
    tableName: Optional[str]
    mysql_credential: Optional[MySQLCredential]
    mssql_credential: Optional[MsSQLCredential]
    cdc_credential: Optional[CdcCredential]
    csv_credential: Optional[CSVCredential]
    branch_credential: Optional[BranchCredential]
    api_base_url: Optional[str]
    facebook_ads_credential: Optional[FacebookAdsCredential]

    class Config:
        allow_population_by_field_name = True


class Integration(Document):
    user_id: PydanticObjectId
    app_id: Indexed(PydanticObjectId)
    provider: IntegrationProvider
    credential: Credential = Field(hidden=True)
    enabled: Optional[bool]

    class Settings:
        name = "integrations"
