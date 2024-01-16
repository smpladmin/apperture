from typing import List, Optional, Set, Union
from beanie import PydanticObjectId

from pydantic import BaseModel

from domain.apps.models import (
    App,
    ClickHouseCredential,
    ClickHouseRemoteConnectionCreds,
    OrgAccess,
)
from rest.dtos.integrations import IntegrationWithDataSources
from rest.dtos.model_response import ModelResponse


class CreateAppDto(BaseModel):
    name: str
    remote_connection: Optional[ClickHouseRemoteConnectionCreds]


class AppDatabaseResponse(BaseModel):
    name: str
    database_credentials: ClickHouseCredential


class AppResponse(App, ModelResponse):
    pass


class AppResponseWithCredentials(ModelResponse):
    id: PydanticObjectId
    name: str
    user_id: PydanticObjectId
    shared_with: Set[PydanticObjectId]
    domain: Union[str, None] = None
    org_access: bool = False
    enabled: bool = True
    clickhouse_credential: Optional[ClickHouseCredential]
    remote_connection: Optional[ClickHouseRemoteConnectionCreds]

    class Config:
        allow_population_by_field_name = True


class AppWithIntegrations(App, ModelResponse):
    shared: bool = False
    integrations: list[IntegrationWithDataSources] = []

    class Config:
        orm_mode = True


class UpdateAppDto(BaseModel):
    shareWithEmails: Optional[List[str]]
    orgAccess: Optional[bool]


class OrgAccessResponse(OrgAccess, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class ClickHouseRemoteConnectionCredsResponse(
    ClickHouseRemoteConnectionCreds, ModelResponse
):
    pass
