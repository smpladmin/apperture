from enum import Enum
from typing import List, Tuple
from pydantic import BaseModel


class SegmentFilterConditions(str, Enum):
    WHERE = "where"
    WHO = "who"
    AND = "and"
    OR = "or"


class SegmentFilterOperators(str, Enum):
    EQUALS = "equals"


class SegmentFilter(BaseModel):
    operator: SegmentFilterOperators
    operand: str
    values: List[str]


class SegmentGroup(BaseModel):
    filters: List[SegmentFilter]
    conditions: List[SegmentFilterConditions]


class ComputedSegment(BaseModel):
    count: int
    data: List[Tuple]
