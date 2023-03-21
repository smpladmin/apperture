from enum import Enum
from typing import List, Dict, Union
from pydantic import BaseModel
from beanie import PydanticObjectId

from domain.common.filter_models import (
    FilterDataType,
    FilterOperatorsNumber,
    FilterOperatorsString,
    FilterOperatorsBool,
    LogicalOperators,
)
from repositories import Document


class SegmentFilterConditions(str, Enum):
    WHERE = "where"
    WHO = "who"
    AND = "and"
    OR = "or"


class SegmentDateFilterType(str, Enum):
    FIXED = "fixed"
    SINCE = "since"
    LAST = "last"


class SegmentAggregationOperators(str, Enum):
    TOTAL = "total"
    SUM = "sum"
    AVERAGE = "average"


class WhereSegmentFilter(BaseModel):
    operand: str
    operator: Union[
        FilterOperatorsNumber,
        FilterOperatorsString,
        FilterOperatorsBool,
    ]
    values: List
    all: bool = False
    type = SegmentFilterConditions.WHERE
    condition: SegmentFilterConditions
    datatype: FilterDataType


class SegmentFixedDateFilter(BaseModel):
    start_date: str
    end_date: str


class SegmentSinceDateFilter(BaseModel):
    start_date: str


class SegmentLastDateFilter(BaseModel):
    days: int


class WhoSegmentFilter(BaseModel):
    operand: str
    operator: FilterOperatorsNumber
    values: List[str]
    triggered: bool
    aggregation: SegmentAggregationOperators
    date_filter: Union[
        SegmentFixedDateFilter, SegmentLastDateFilter, SegmentSinceDateFilter
    ]
    date_filter_type: SegmentDateFilterType
    type = SegmentFilterConditions.WHO
    condition: SegmentFilterConditions
    datatype = FilterDataType.NUMBER


class SegmentGroup(BaseModel):
    filters: List[Union[WhoSegmentFilter, WhereSegmentFilter]]
    condition: LogicalOperators


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
