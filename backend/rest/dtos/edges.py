from pydantic import BaseModel

from domain.common.models import IntegrationProvider
from domain.edge.models import Edge
from rest.dtos.model_response import ModelResponse


class CreateEdgeDto(BaseModel):
    previousEvent: str
    currentEvent: str
    users: int
    hits: int
    date: str
    rolledPreviousEvent: str
    rolledCurrentEvent: str


class CreateEdgesDto(BaseModel):
    datasourceId: str
    provider: IntegrationProvider
    edges: list[CreateEdgeDto]


class EdgeResponse(Edge, ModelResponse):
    pass
