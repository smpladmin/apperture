from enum import Enum
from typing import List, Optional

from beanie import Indexed, PydanticObjectId
from pydantic import BaseModel, Field

from domain.common.models import IntegrationProvider
from repositories import Document
from utils.mssql_clickhouse_datatypes import MSSQL_CLICKHOUSE_DATATYPE_MAPPING
from utils.mysql_clickhouse_datatypes import MYSQL_CLICKHOUSE_DATATYPE_MAPPING
from utils.psql_clickhouse_datatypes import PSQL_CLICKHOUSE_DATATYPE_MAPPING


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"
    MYSQL = "MYSQL"
    MSSQL = "MSSQL"
    CSV = "CSV"
    BRANCH = "BRANCH"
    CDC = "CDC"
    FACEBOOK_ADS = "FACEBOOK_ADS"
    TATA_IVR = "TATA_IVR"
    GOOGLE_ADS = "GOOGLE_ADS"


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
    POSTGRESQL = "psql"

    def get_connector_class(self):
        connector_class_dict = {
            self.MYSQL: "mysql.MySqlConnector",
            self.MSSQL: "sqlserver.SqlServerConnector",
            self.POSTGRESQL: "postgresql.PostgresConnector",
        }
        return "io.debezium.connector." + connector_class_dict.get(self)

    def get_datatype_mapping(self):
        datatype_mapping = {
            self.MYSQL: MYSQL_CLICKHOUSE_DATATYPE_MAPPING,
            self.MSSQL: MSSQL_CLICKHOUSE_DATATYPE_MAPPING,
            self.POSTGRESQL: PSQL_CLICKHOUSE_DATATYPE_MAPPING,
        }
        return datatype_mapping.get(self)


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
    tata_ivr_token: Optional[str]

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
