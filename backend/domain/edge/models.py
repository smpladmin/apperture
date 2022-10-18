import datetime
from typing import List, Optional
from beanie import PydanticObjectId, UnionDoc
from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from domain.notifications.models import ThresholdMap
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


class NotificationNodeData(BaseModel):
    name: str
    notification_id: PydanticObjectId
    node_data: List[List[AggregatedEdge]]
    prev_day_node_data: List[List[AggregatedEdge]]
    threshold_type: Optional[str]
    threshold_value: Optional[ThresholdMap]
