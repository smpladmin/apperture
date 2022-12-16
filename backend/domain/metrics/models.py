from enum import Enum
from typing import List, Dict
from pydantic import BaseModel
from beanie import PydanticObjectId

from repositories import Document

class SegmentsAndEventsType(str, Enum):
    EVENT = "event"
    SEGMENT = "segment"

class SegmentsAndEventsFilterOperator(str, Enum):
    IN = "IN"
    NOT_IN = "NOT_IN"
    EQUAL = "EQUAL"
    NOT_EQUAL = "NOT_EQUAL"
    GREATER = "GREATER"
    GREATER_OR_EQUAL = "GREATER_OR_EQUAL"
    LESS = "LESS"
    LESS_OR_EQUAL = "LESS_OR_EQUAL"
    BETWEEN = "BETWEEN"
    

class SegmentsAndEventsAggregationsFunctions(str,Enum):
    SUM = "sum"
    AVG = "avg"
    MIN = "min"
    MAX = "max"
    COUNT = "count"

class SegmentsAndEventsAggregations(BaseModel):
    functions:str
    property:str

class SegmentsAndEventsFilter(BaseModel):
    operator :SegmentsAndEventsFilterOperator
    operand: str
    values: List[str]

class SegmentsAndEvents(BaseModel):
    variables:str
    variant:SegmentsAndEventsType
    aggregations: SegmentsAndEventsAggregations
    reference:str
    filter: SegmentsAndEventsFilter

class Metric(BaseModel):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    description: str
    functions:str
    aggregates:List[SegmentsAndEvents]
    breakdown:List[str]
