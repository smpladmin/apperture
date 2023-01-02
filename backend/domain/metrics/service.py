from typing import List
from mongo import Mongo
from fastapi import Depends
from domain.metrics.models import (
    Metric,
    SegmentsAndEventsType,
    SegmentsAndEvents,
    ComputedMetricResult,
)
from repositories.clickhouse.metric import Metrics
from repositories.clickhouse.events import Events


class MetricService:
    def __init__(
        self,
        metric: Metrics = Depends(),
        mongo: Mongo = Depends(),
        event:Events = Depends(),
    ):
        self.metric = metric
        self.mongo = mongo
        self.event = event

    async def compute_metric(
        self,
        datasource_id: str,
        function: str,
        aggregates: List[SegmentsAndEvents],
        breakdown: List[str],
    ) -> ComputedMetricResult:
        computed_metric = self.event.execute_get_query( *self.metric.build_metric_compute_query(
            datasource_id=datasource_id,
            aggregates=aggregates,
            breakdown=breakdown,
            function=function,
        ))
        data = [dict(zip(["date", "value"], row)) for row in computed_metric]
        return ComputedMetricResult(metric=data)
