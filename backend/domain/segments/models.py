from datetime import datetime
from enum import Enum
from typing import List, Dict, Union, Optional
from pydantic import BaseModel
from beanie import PydanticObjectId

from repositories import Document


class SegmentFilterConditions(str, Enum):
    WHERE = "where"
    WHO = "who"
    AND = "and"
    OR = "or"


class SegmentGroupConditions(str, Enum):
    AND = "and"
    OR = "or"


class SegmentFilterOperators(str, Enum):
    EQUALS = "equals"


class SegmentAggregationOperators(str, Enum):
    TOTAL = "total"
    SUM = "sum"
    AVERAGE = "average"


class WhereSegmentFilter(BaseModel):
    operand: str
    operator: SegmentFilterOperators
    values: List[str]
    all: bool
    type = SegmentFilterConditions.WHERE
    condition: SegmentFilterConditions


class WhoSegmentFilter(BaseModel):
    operand: str
    operator: SegmentFilterOperators
    values: List[str]
    triggered: bool
    aggregation: SegmentAggregationOperators
    start_date: Optional[str]
    end_date: Optional[str]
    type = SegmentFilterConditions.WHO
    condition: SegmentFilterConditions


class SegmentGroup(BaseModel):
    filters: List[Union[WhoSegmentFilter, WhereSegmentFilter]]
    condition: SegmentGroupConditions


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
    columns: List[str]

    class Settings:
        name = "segments"
