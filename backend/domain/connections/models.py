from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel


class ConnectionSource(BaseModel):
    name: str
    fields: List[str]
    datasource_id: Optional[PydanticObjectId]
    table_name: str
    database_name: str


class ConnectionGroup(BaseModel):
    provider: str
    connection_source: List[ConnectionSource]


class Connections(BaseModel):
    server: str
    connection_data: List[ConnectionGroup]
