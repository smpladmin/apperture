from typing import Optional, Union

from domain.common.models import IntegrationProvider
from domain.edge.models import (AggregatedEdge, Edge, NodeSankey,
                                NodeSignificance, NodeTrend)
from pydantic import BaseModel
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
    city: Optional[str]
    region: Optional[str]
    country: Optional[str]
    utmSource: Optional[str]
    utmMedium: Optional[str]
    os: Optional[str]
    appVersion: Optional[str]


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


class NodeSignificanceResponse(NodeSignificance, ModelResponse):
    class Config:
        allow_population_by_field_name = True
