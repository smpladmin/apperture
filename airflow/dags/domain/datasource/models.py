from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional, NamedTuple


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"
    BRANCH = "BRANCH"
    FACEBOOK_ADS = "FACEBOOK_ADS"
    TATA_IVR = "TATA_IVR"
    GOOGLE_ADS = "GOOGLE_ADS"


class BranchCredential(BaseModel):
    app_id: str
    branch_key: str
    branch_secret: str


class FacebookAdsCredential(BaseModel):
    account_ids: List[str]
    access_token: str


class Credential(BaseModel):
    type: CredentialType
    account_id: Optional[str] = Field(alias="accountId")
    refresh_token: Optional[str] = Field(alias="refreshToken")
    api_key: Optional[str] = Field(alias="apiKey")
    tableName: Optional[str]
    secret: Optional[str]
    api_base_url: Optional[str] = Field(alias="apiBaseUrl")
    branch_credential: Optional[BranchCredential] = Field(alias="branchCredential")
    facebook_ads_credential: Optional[FacebookAdsCredential] = Field(
        alias="facebookAdsCredential"
    )
    tata_ivr_token: Optional[str] = Field(alias="tataIvrToken")


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
    BRANCH = "branch"
    FACEBOOK_ADS = "facebook_ads"
    TATA_IVR = "tata_ivr"
    GOOGLE_ADS = "google_ads"


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


class TataIvrEvents(NamedTuple):
    id: str
    timestamp: datetime
    datasource_id: str
    call_id: str
    uuid: str
    date: str
    time: str
    end_stamp: datetime
    missed_agents: str
    status: str
    direction: str
    call_duration: int
    answered_seconds: int
    minutes_consumed: int
    broadcast_id: str
    dtmf_input: str
    client_number: str
    hangup_cause: str
    did_number: str
    contact_details: str
    recording_url: str
    service: str
    properties: dict
