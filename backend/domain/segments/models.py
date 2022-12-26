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


class WhoSegmentFilter(BaseModel):
    operand: str
    operator: SegmentFilterOperators
    values: List[str]
    triggered: bool
    aggregation: SegmentAggregationOperators
    start_date: Optional[datetime]
    end_date: Optional[datetime]


class SegmentGroup(BaseModel):
    filters: List[Union[WhoSegmentFilter, WhereSegmentFilter]]
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
