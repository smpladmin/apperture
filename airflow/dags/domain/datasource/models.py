from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, NamedTuple


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


class DataSourceVersion(str, Enum):
    V3 = "V3"
    V4 = "V4"
    DEFAULT = "DEFAULT"


class IntegrationProvider(str, Enum):
    GOOGLE = "google"
    MIXPANEL = "mixpanel"
    AMPLITUDE = "amplitude"
    CLEVERTAP = "clevertap"
    API = "api"


class DataSource(BaseModel):
    id: str = Field(alias="_id")
    createdAt: datetime
    provider: IntegrationProvider
    name: Optional[str]
    external_source_id: str = Field(alias="externalSourceId")
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
