from enum import Enum
from typing import Optional, Union, List

from beanie import PydanticObjectId
from pydantic import BaseModel
from domain.common.date_models import DateFilter
from domain.segments.models import WhereSegmentFilter
from repositories import Document
from pypika import analytics as an, functions as fn, CustomFunction


class SegmentsAndEventsType(str, Enum):
    EVENT = "event"
    SEGMENT = "segment"


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


class SegmentsAndEvents(BaseModel):
    variable: str
    variant: SegmentsAndEventsType
    aggregations: SegmentsAndEventsAggregations
    reference_id: str
    filters: List[WhereSegmentFilter]


class Metric(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    function: str
    aggregates: List[SegmentsAndEvents]
    breakdown: List[str]
    date_filter: Optional[DateFilter]
    enabled: bool = True

    class Settings:
        name = "metric"


class MetricBreakdown(BaseModel):
    property: str
    value: str


class MetricValue(BaseModel):
    date: str
    value: float


class ComputedMetricData(BaseModel):
    breakdown: List[MetricBreakdown]
    data: List[MetricValue]


class ComputedMetricStep(BaseModel):
    name: str
    series: List[ComputedMetricData]
