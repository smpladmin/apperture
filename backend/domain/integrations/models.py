from enum import Enum
from typing import List, Optional
from beanie import Indexed
from pydantic import BaseModel

from repositories import Document


class IntegrationVendor(str, Enum):
    GOOGLE = "google"


class AppVersion(str, Enum):
    V3 = "V3"
    V4 = "V4"
    DEFAULT = "DEFAULT"


class VendorApp(BaseModel):
    id: str
    name: Optional[str]
    version: AppVersion


class CredentialType(str, Enum):
    OAUTH = "OAUTH"
    API_KEY = "API_KEY"


class Credential(BaseModel):
    type: CredentialType
    account_id: str
    refresh_token: Optional[str]
    api_key: Optional[str]
    secret: Optional[str]


class Integration(Document):
    user_id: str
    app_id: Indexed(str)
    vendor: IntegrationVendor
    vendor_apps: List[VendorApp]
    credential: Credential

    class Settings:
        name = "integrations"
