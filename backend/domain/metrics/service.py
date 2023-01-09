from typing import List, Optional
from mongo import Mongo
from fastapi import Depends
from domain.metrics.models import (
    Metric,
    SegmentsAndEventsType,
    SegmentsAndEvents,
    ComputedMetricResult,
)
from repositories.clickhouse.metric import Metrics


class MetricService:
    def __init__(
        self,
        metric: Metrics = Depends(),
        mongo: Mongo = Depends(),
    ):
        self.metric = metric
        self.mongo = mongo

    async def compute_metric(
        self,
        datasource_id: str,
        function: str,
        aggregates: List[SegmentsAndEvents],
        breakdown: List[str],
        start_date: Optional[str],
        end_date: Optional[str],
    ) -> ComputedMetricResult:
        computed_metric = self.metric.compute_query(
            datasource_id=datasource_id,
            aggregates=aggregates,
            breakdown=breakdown,
            function=function,
            start_date=start_date,
            end_date=end_date,
        )

        data = [dict(zip(["date", "value"], row)) for row in computed_metric]
        return ComputedMetricResult(metric=data)
