import datetime
from enum import Enum
from typing import NamedTuple, Optional
from pydantic import BaseModel, Field

from domain.common.models import IntegrationProvider


class DataSourceVersion(str, Enum):
    V3 = "V3"
    V4 = "V4"
    DEFAULT = "DEFAULT"


class DataSource(BaseModel):
    id: str = Field(alias="_id")
    provider: IntegrationProvider
    name: Optional[str]
    external_source_id: str = Field(alias="externalSourceId")
    version: DataSourceVersion


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"


class Credential(BaseModel):
    type: CredentialType
    account_id: str = Field(alias="accountId")
    refresh_token: Optional[str] = Field(alias="refreshToken")
    api_key: Optional[str] = Field(alias="apiKey")
    tableName: Optional[str]
    secret: Optional[str]
    api_base_url: Optional[str] = Field(alias="apiBaseUrl")


class DataSourceResponse(BaseModel):
    datasource: DataSource
    credential: Credential


class CreateEvent(NamedTuple):
    datasourceId: str
    timestamp: datetime.datetime
    provider: IntegrationProvider
    userId: str
    eventName: str
    properties: dict
