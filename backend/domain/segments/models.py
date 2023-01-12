import datetime
from enum import Enum
from typing import List, Dict, Union
from pydantic import BaseModel
from beanie import PydanticObjectId
from operator import eq, ge, gt, le, lt, ne

from repositories import Document


class SegmentFilterConditions(str, Enum):
    WHERE = "where"
    WHO = "who"
    AND = "and"
    OR = "or"


class SegmentDataType(Enum):
    STRING = "String"
    NUMBER = "Number"
    DATETIME = "Date"
    BOOL = "True/ False"

    def get_pytype(self):
        type_dict = {
            self.STRING: str,
            self.NUMBER: float,
            self.BOOL: bool,
            self.DATETIME: datetime.datetime,
        }
        return type_dict[self]


class SegmentFilterOperatorsString(str, Enum):
    IS = "is"
    IS_NOT = "is not"
    CONTAINS = "contains"
    DOES_NOT_CONTAIN = "does not contain"


class SegmentFilterOperatorsNumber(str, Enum):
    EQ = "equals"
    NE = "not equal"
    GT = "greater than"
    GE = "greater than or equal to"
    LT = "less than"
    LE = "less than or equal to"
    BETWEEN = "between"
    NOT_BETWEEN = "not between"

    def get_pyoperator(self):
        type_dict = {
            self.LE: le,
            self.GE: ge,
            self.GT: gt,
            self.LT: lt,
            self.EQ: eq,
            self.NE: ne,
        }
        return type_dict.get(self, eq)


class SegmentFilterOperatorsBool(str, Enum):
    T = "is true"
    F = "is false"


class SegmentGroupConditions(str, Enum):
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
        SegmentFilterOperatorsNumber,
        SegmentFilterOperatorsString,
        SegmentFilterOperatorsBool,
    ]
    values: List
    all: bool = False
    type = SegmentFilterConditions.WHERE
    condition: SegmentFilterConditions
    datatype: SegmentDataType


class SegmentFixedDateFilter(BaseModel):
    start_date: str
    end_date: str


class SegmentSinceDateFilter(BaseModel):
    start_date: str


class SegmentLastDateFilter(BaseModel):
    days: int


class WhoSegmentFilter(BaseModel):
    operand: str
    operator: SegmentFilterOperatorsNumber
    values: List[str]
    triggered: bool
    aggregation: SegmentAggregationOperators
    date_filter: Union[
        SegmentFixedDateFilter, SegmentLastDateFilter, SegmentSinceDateFilter
    ]
    date_filter_type: SegmentDateFilterType
    type = SegmentFilterConditions.WHO
    condition: SegmentFilterConditions
    datatype = SegmentDataType.NUMBER


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
