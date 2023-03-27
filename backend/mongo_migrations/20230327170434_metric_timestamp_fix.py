from enum import Enum
from typing import List, Union
from operator import eq, ge, gt, le, lt, ne

from beanie import iterative_migration, PydanticObjectId
from pydantic import BaseModel
from pypika import analytics as an, functions as fn, CustomFunction

from datetime import datetime
from typing import Optional
from beanie import (
    Document as BeanieDocument,
    Insert,
    Replace,
    SaveChanges,
    before_event,
)


class Document(BeanieDocument):
    created_at: datetime
    updated_at: datetime

    @before_event([Insert, Replace, SaveChanges])
    def set_updated_at(self):
        self.updated_at = datetime.utcnow()


class FilterOperatorsString(str, Enum):
    IS = "is"
    IS_NOT = "is not"
    CONTAINS = "contains"
    DOES_NOT_CONTAIN = "does not contain"


class FilterOperatorsNumber(str, Enum):
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


class FilterOperatorsBool(str, Enum):
    T = "is true"
    F = "is false"


class FilterDataType(Enum):
    STRING = "String"
    NUMBER = "Number"
    DATETIME = "Date"
    BOOL = "True/ False"

    def get_pytype(self):
        type_dict = {
            self.STRING: str,
            self.NUMBER: float,
            self.BOOL: bool,
            self.DATETIME: datetime,
        }
        return type_dict[self]


class SegmentFilterConditions(str, Enum):
    WHERE = "where"
    WHO = "who"
    AND = "and"
    OR = "or"


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


class MetricBasicAggregation(str, Enum):
    COUNT = "count"
    UNIQUE = "unique"
    TOTAL_PER_USER = "total_per_user"
    COUNT_SESSIONS = "count_sessions"


class MetricAggregatePropertiesAggregation(str, Enum):
    SUM = "ap_sum"
    AVERAGE = "ap_average"
    MEDIAN = "ap_median"
    DISTINCT_COUNT = "ap_distinct_count"
    MIN = "ap_min"
    MAX = "ap_max"
    P25 = "ap_p25"
    P75 = "ap_p75"
    P90 = "ap_p90"
    P99 = "ap_p99"

    def get_pypika_function(self):
        quantile_func = CustomFunction("quantile", ["number"])
        type_dict = {
            self.SUM: an.Sum,
            self.AVERAGE: an.Avg,
            self.MEDIAN: CustomFunction(str(quantile_func(0.5)), ["variable"]),
            self.DISTINCT_COUNT: fn.Count,
            self.MIN: an.Min,
            self.MAX: an.Max,
            self.P25: CustomFunction(str(quantile_func(0.25)), ["variable"]),
            self.P75: CustomFunction(str(quantile_func(0.75)), ["variable"]),
            self.P90: CustomFunction(str(quantile_func(0.9)), ["variable"]),
            self.P99: CustomFunction(str(quantile_func(0.99)), ["variable"]),
        }
        return type_dict.get(self, an.Sum)


class SegmentsAndEventsAggregations(BaseModel):
    functions: Union[MetricBasicAggregation, MetricAggregatePropertiesAggregation]
    property: str


class SegmentsAndEventsType(str, Enum):
    EVENT = "event"
    SEGMENT = "segment"


class DateFilterType(str, Enum):
    FIXED = "fixed"
    SINCE = "since"
    LAST = "last"


class FixedDateFilter(BaseModel):
    start_date: str
    end_date: str


class SinceDateFilter(BaseModel):
    start_date: str


class LastDateFilter(BaseModel):
    days: int


class DateFilter(BaseModel):
    filter: Optional[Union[LastDateFilter, FixedDateFilter]]
    type: Optional[DateFilterType]


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


class SegmentsAndEventsFilter(BaseModel):
    operator: SegmentsAndEventsFilterOperator
    operand: str
    values: List[str]


class OldSegmentsAndEvents(BaseModel):
    variable: str
    variant: SegmentsAndEventsType
    aggregations: SegmentsAndEventsAggregations
    reference_id: str
    filters: List[SegmentsAndEventsFilter]
    conditions: List[str]


class NewSegmentsAndEvents(BaseModel):
    variable: str
    variant: SegmentsAndEventsType
    aggregations: SegmentsAndEventsAggregations
    reference_id: str
    filters: List[WhereSegmentFilter]


class OldMetric(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    function: str
    aggregates: List[OldSegmentsAndEvents]
    breakdown: List[str]
    date_filter: Optional[DateFilter]

    class Settings:
        name = "metric"


class Metric(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    function: str
    aggregates: List[NewSegmentsAndEvents]
    breakdown: List[str]
    date_filter: Optional[DateFilter]

    class Settings:
        name = "metric"


class Forward:
    @iterative_migration()
    async def roll_to_newer_version(
        self, input_document: OldMetric, output_document: Metric
    ):
        aggregates = [
            NewSegmentsAndEvents(
                variable=aggregate.variable,
                variant=aggregate.variant,
                aggregations=aggregate.aggregations,
                reference_id=aggregate.reference_id,
                filters=[
                    WhereSegmentFilter(
                        operator="is",
                        operand=filter.operand,
                        values=filter.values,
                        all=False,
                        type="where",
                        datatype="String",
                        condition=SegmentFilterConditions.WHERE if i==0 else SegmentFilterConditions.AND,
                    )
                    for i, filter in enumerate(aggregate.filters)
                ],
            )
            for aggregate in input_document.aggregates
        ]
        output_document.aggregates = aggregates
        output_document.created_at = input_document.created_at
        output_document.updated_at = output_document.updated_at


class Backward:
    @iterative_migration()
    async def roll_to_previous_version(
        self, input_document: Metric, output_document: OldMetric
    ):
        aggregates = [
            OldSegmentsAndEvents(
                variable=aggregate.variable,
                variant=aggregate.variant,
                aggregations=aggregate.aggregations,
                reference_id=aggregate.reference_id,
                filters=[
                    SegmentsAndEventsFilter(
                        operator="equals",
                        operand=filter.operand,
                        values=filter.values,
                    )
                    for filter in aggregate.filters
                ],
                conditions=[filter.condition for filter in aggregate.filters],
            )
            for aggregate in input_document.aggregates
        ]
        output_document.aggregates = aggregates
        output_document.created_at = input_document.created_at
        output_document.updated_at = output_document.updated_at
