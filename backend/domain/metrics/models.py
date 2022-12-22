from enum import Enum
from typing import List, Dict
from pydantic import BaseModel
from beanie import PydanticObjectId

from repositories import Document

class SegmentsAndEventsType(str, Enum):
    EVENT = "event"
    SEGMENT = "segment"

class SegmentsAndEventsFilterOperator(str, Enum):
    IN = "in"
    NOT_IN = "not_in"
    EQUALS = "equals"
    NOT_EQUAL = "not_equal"
    GREATER = "greater"
    GREATER_OR_EQUAL = "greater_or_equal"
    LESS = "less"
    LESS_OR_EQUAL = "less_or_equal"
    BETWEEN = "between"
    

class SegmentsAndEventsAggregationsFunctions(str,Enum):
    SUM = "sum"
    AVG = "avg"
    MIN = "min"
    MAX = "max"
    COUNT = "count"

class SegmentsAndEventsAggregations(BaseModel):
    functions:SegmentsAndEventsAggregationsFunctions
    property:str

class SegmentsAndEventsFilter(BaseModel):
    operator :SegmentsAndEventsFilterOperator
    operand: str
    values: List[str]

class SegmentsAndEvents(BaseModel):
    variable:str
    variant:SegmentsAndEventsType
    aggregations: SegmentsAndEventsAggregations
    reference_id:str
    filters: List[SegmentsAndEventsFilter]
    conditions:List[str]

class Metric(BaseModel):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    description: str
    functions:str
    aggregates:List[SegmentsAndEvents]
    breakdown:List[str]

class ComputedMetricResult(BaseModel):
    metric:int
    data:List[Dict]

class ComputeMetricRequest(BaseModel):
    datasource_id:PydanticObjectId
    function: str
    aggregates:List[SegmentsAndEvents]
    breakdown:List[str]