from typing import List
from pydantic import BaseModel
from beanie import PydanticObjectId

from domain.segments.models import (
    SegmentGroup,
    ComputedSegment,
    Segment,
)
from rest.dtos.model_response import ModelResponse


class TransientSegmentDto(BaseModel):
    datasourceId: PydanticObjectId
    groups: List[SegmentGroup]
    columns: List[str]


class CreateSegmentDto(BaseModel):
    name: str
    description: str
    datasourceId: PydanticObjectId
    groups: List[SegmentGroup]
    columns: List[str]


class ComputedSegmentResponse(ComputedSegment, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class SegmentResponse(Segment, ModelResponse):
    class Config:
        allow_population_by_field_name = True
