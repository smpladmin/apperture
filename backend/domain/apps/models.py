from typing import Optional, Set, Union

from beanie import Indexed, PydanticObjectId
from pydantic import BaseModel, Field

from repositories import Document


class ClickHouseRemoteConnectionCreds(BaseModel):
    host: str
    port: str
    username: str
    password: str


class ClickHouseCredential(BaseModel):
    username: str
    password: str
    databasename: str
    remote_connection: Optional[ClickHouseRemoteConnectionCreds]


class OrgAccess(BaseModel):
    org_access: bool
    domain: Union[str, None]


class App(Document):
    name: str
    user_id: Indexed(PydanticObjectId)
    shared_with: Set[PydanticObjectId] = set()
    domain: Union[str, None] = None
    org_access: bool = False
    enabled: bool = True
    clickhouse_credential: Optional[ClickHouseCredential] = Field(hidden=True)

    class Settings:
        name = "apps"
