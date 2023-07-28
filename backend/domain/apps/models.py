from typing import List, Optional, Set

from beanie import Indexed, PydanticObjectId
from pydantic import BaseModel, Field

from repositories import Document


class ClickHouseCredential(BaseModel):
    username: str
    password: str
    databasename: str


class App(Document):
    name: str
    user_id: Indexed(PydanticObjectId)
    shared_with: Set[PydanticObjectId] = set()
    enabled: bool = True
    clickhouse_credential: Optional[ClickHouseCredential] = Field(hidden=True)

    class Settings:
        name = "apps"
