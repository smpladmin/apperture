from typing import List, Optional,Union

from beanie import PydanticObjectId
from mongo import Mongo
from datetime import datetime
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
    
    async def build_metric(self,
        datasource_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: PydanticObjectId,
        name: str,
        function: str,
        aggregates: List[SegmentsAndEvents],
        breakdown: List[str],
    ):
        return Metric(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            function=function,
            aggregates=aggregates,
            breakdown=breakdown,
        )
    
    async def add_metric(self,metric:Metric):
        metric.updated_at=metric.created_at
        return await Metric.insert(metric)

    async def update_metric(self,metric_id:str,metric:Metric):
        entry = metric.dict()
        print("============\n",entry,"\n============")
        entry.pop("id")
        entry.pop("created_at")
        entry["updated_at"] = datetime.utcnow()

        await Metric.find_one(
            Metric.id == PydanticObjectId(metric_id),
        ).update({"$set": entry})

    async def get_metric_by_id(self,metric_id:str):
        return await Metric.find_one(Metric.id == PydanticObjectId(metric_id))
