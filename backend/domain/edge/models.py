import datetime
from beanie import PydanticObjectId
from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from repositories import Document


class Edge(Document):
    datasource_id: PydanticObjectId
    provider: IntegrationProvider
    previous_event: str
    current_event: str
    users: int
    hits: int
    date: datetime.datetime

    class Settings:
        name = "edges"


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
