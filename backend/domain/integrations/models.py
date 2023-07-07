from enum import Enum
from typing import Optional
from beanie import Indexed, PydanticObjectId
from pydantic import BaseModel, Field

from domain.common.models import IntegrationProvider
from repositories import Document


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"


class Credential(BaseModel):
    type: CredentialType
    account_id: str
    refresh_token: Optional[str]
    api_key: Optional[str]
    secret: Optional[str]
    tableName: Optional[str]

    class Config:
        allow_population_by_field_name = True


class Integration(Document):
    user_id: PydanticObjectId
    app_id: Indexed(PydanticObjectId)
    provider: IntegrationProvider
    credential: Credential = Field(hidden=True)

    class Settings:
        name = "integrations"
