from enum import Enum
from typing import List, Dict
from pydantic import BaseModel
from beanie import PydanticObjectId

from repositories import Document


class SegmentFilterConditions(str, Enum):
    WHERE = "where"
    WHO = "who"
    AND = "and"
    OR = "or"


class SegmentFilterOperators(str, Enum):
    EQUALS = "equals"


class SegmentFilter(BaseModel):
    operand: str
    operator: SegmentFilterOperators
    values: List[str]


class SegmentGroup(BaseModel):
    filters: List[SegmentFilter]
    conditions: List[SegmentFilterConditions]


class ComputedSegment(BaseModel):
    count: int
    data: List[Dict]


class Segment(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    description: str
    groups: List[SegmentGroup]
    group_conditions: List[SegmentFilterConditions]
    columns: List[str]

    class Settings:
        name = "segments"
