import datetime
from typing import Optional
from beanie import PydanticObjectId, UnionDoc
from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from repositories import Document


class BaseEdge(UnionDoc):
    class Settings:
        name = "edges"


class Edge(Document):
    datasource_id: PydanticObjectId
    provider: IntegrationProvider
    previous_event: str
    current_event: str
    users: int
    hits: int
    date: datetime.datetime

    class Settings:
        union_doc = BaseEdge


class RichEdge(Document):
    datasource_id: PydanticObjectId
    provider: IntegrationProvider
    previous_event: str
    current_event: str
    hits: int
    date: datetime.datetime
    city: str
    region: str
    country: str
    utm_source: str
    utm_medium: str
    os: str
    app_version: str

    class Settings:
        union_doc = BaseEdge


class AggregatedEdge(BaseModel):
    previous_event: str
    current_event: str
    users: int
    hits: int
