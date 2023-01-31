import datetime
from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel, validator

from beanie import PydanticObjectId, UnionDoc
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


class SankeyDirection(str, Enum):
    INFLOW = "inflow"
    OUTFLOW = "outflow"


class TrendType(str, Enum):
    MONTH = "month"
    WEEK = "week"
    DATE = "date"


backend_crm_nodes = [
    "documents_verified",
    "eligibility_invalid",
    "insurance_processed",
    "offer_confirmed",
]


class Node(BaseModel):
    id: str
    name: str
    provider: str
    source: str = None

    @validator("source", always=True)
    def composite_name(cls, v, values, **kwargs):
        if values["name"] in backend_crm_nodes:
            return "Backend CRM"
        else:
            return values["provider"]


class NodeTrend(BaseModel):
    node: str
    users: int
    hits: int
    year: int
    trend: Union[int, datetime.date]
    start_date: datetime.datetime
    end_date: datetime.datetime


class NodeSankey(BaseModel):
    node: str
    current_event: str
    previous_event: str
    hits: int
    users: int
    flow: SankeyDirection
    hits_percentage: float
    users_percentage: float


class NodeSignificance(BaseModel):
    node: str
    node_hits: int
    total_hits: int
    node_users: Optional[int]
    total_users: Optional[int]


class NotificationNodeData(BaseModel):
    name: str
    notification_id: PydanticObjectId
    node_data: List[List[AggregatedEdge]]
    prev_day_node_data: List[List[AggregatedEdge]]
    threshold_type: Optional[str]
    threshold_value: Optional[ThresholdMap]
