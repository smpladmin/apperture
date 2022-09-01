from enum import Enum
from typing import Optional

from beanie import Indexed, PydanticObjectId
from domain.common.models import IntegrationProvider
from repositories.document import Document


class DataSourceVersion(str, Enum):
    V3 = "V3"
    V4 = "V4"
    DEFAULT = "DEFAULT"


class DataSource(Document):
    integration_id: Indexed(PydanticObjectId)
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    provider: IntegrationProvider
    name: Optional[str]
    external_source_id: str
    version: DataSourceVersion

    class Settings:
        name = "datasources"
