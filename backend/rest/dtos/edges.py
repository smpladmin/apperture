from typing import Union
from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from domain.edge.models import Edge, AggregatedEdge, NodeTrend, NodeSankey
from rest.dtos.model_response import ModelResponse


class CreateEdgeDto(BaseModel):
    previousEvent: str
    currentEvent: str
    users: int
    hits: int
    date: str


class CreateRichEdgeDto(BaseModel):
    previousEvent: str
    currentEvent: str
    hits: int
    date: str
    city: str
    region: str
    country: str
    utmSource: str
    utmMedium: str
    os: str
    appVersion: str


class CreateEdgesDto(BaseModel):
    datasourceId: str
    provider: IntegrationProvider
    edges: Union[list[CreateEdgeDto], list[CreateRichEdgeDto]]


class EdgeResponse(Edge, ModelResponse):
    pass


class AggregatedEdgeResponse(AggregatedEdge, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class NodeTrendResponse(NodeTrend, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class NodeSankeyResponse(NodeSankey, ModelResponse):
    class Config:
        allow_population_by_field_name = True
