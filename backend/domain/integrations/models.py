from enum import Enum
from typing import Optional, Union
from beanie import Indexed, PydanticObjectId
from pydantic import BaseModel, Field

from domain.common.models import IntegrationProvider
from repositories import Document


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"
    DATABASE = "DATABASE"


class DatabaseSSHCredential(BaseModel):
    server: str
    port: str
    username: Optional[str]
    password: Optional[str]
    ssh_key: Optional[str]

    class Config:
        allow_population_by_field_name = True


class DatabaseCredential(BaseModel):
    host: str
    port: str
    username: str
    password: str
    over_ssh: bool = False
    ssh_credential: Optional[DatabaseSSHCredential]

    class Config:
        allow_population_by_field_name = True


class Credential(BaseModel):
    type: CredentialType
    account_id: Optional[str]
    refresh_token: Optional[str]
    api_key: Optional[str]
    secret: Optional[str]
    database_credential: Optional[DatabaseCredential]

    class Config:
        allow_population_by_field_name = True


class Integration(Document):
    user_id: PydanticObjectId
    app_id: Indexed(PydanticObjectId)
    provider: IntegrationProvider
    credential: Credential = Field(hidden=True)

    class Settings:
        name = "integrations"
