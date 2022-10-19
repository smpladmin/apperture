import datetime
from typing import Optional

from beanie import PydanticObjectId, UnionDoc
from domain.common.models import IntegrationProvider
from pydantic import BaseModel
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
    city: Optional[str]
    region: Optional[str]
    country: Optional[str]
    utm_source: Optional[str]
    utm_medium: Optional[str]
    os: Optional[str]
    app_version: Optional[str]

    class Settings:
        union_doc = BaseEdge


class AggregatedEdge(BaseModel):
    previous_event: str
    current_event: str
    users: int
    hits: int


class NodeTrend(BaseModel):
    node: str
    users: int
    hits: int
    date: datetime.datetime
    week: int
    month: int
    year: int
    start_date: datetime.datetime
    end_date: datetime.datetime


class NodeSankey(BaseModel):
    node: str
    current_event: str
    previous_event: str
    hits: int
    users: int
    flow: str
    hits_percentage: float
    users_percentage: float


class NodeSignificance(BaseModel):
    node: str
    node_hits: int
    total_hits: int
