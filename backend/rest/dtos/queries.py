from typing import List, Dict
from pydantic import BaseModel
from domain.queries.models import Queries
from rest.dtos.model_response import ModelResponse


class QueriesTableDto(BaseModel):
    query_id: str
    datasourceId: str


class QueriesDto(BaseModel):
    datasourceId: str
    query: str


class QueriesResponse(Queries, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class QueryComparisonDto(BaseModel):
    query_ids: List[str]
    key_columns: List[str]
    compare_columns: Dict[str, str]
