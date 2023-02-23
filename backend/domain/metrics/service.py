from typing import List, Optional
from beanie import PydanticObjectId
from mongo import Mongo
from datetime import datetime
from fastapi import Depends

from domain.metrics.models import (
    Metric,
    SegmentsAndEvents,
    ComputedMetricStep,
    MetricBreakdown,
    MetricValue,
    ComputedMetricData,
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
    ) -> [ComputedMetricStep]:
        computed_metric = self.metric.compute_query(
            datasource_id=datasource_id,
            aggregates=aggregates,
            breakdown=breakdown,
            function=function,
            start_date=start_date,
            end_date=end_date,
        )
        keys = ["date"]
        keys.extend(breakdown + function.split(","))

        breakdown_combinations = (
            list(
                dict.fromkeys([row[1 : len(breakdown) + 1] for row in computed_metric])
            )
            if breakdown
            else []
        )

        breakdown_combinations = [
            dict(zip(breakdown, combination)) for combination in breakdown_combinations
        ]

        computed_metric_steps = []
        for func in function.split(","):
            series = []
            if not breakdown_combinations:
                metric_data = [dict(zip(keys, row)) for row in computed_metric]
                metric_values = [
                    MetricValue(
                        date=data["date"].strftime("%Y-%m-%d"), value=data[func]
                    )
                    for data in metric_data
                ]
                series.append(ComputedMetricData(breakdown=[], data=metric_values))

            else:
                for combination in breakdown_combinations:
                    metric_breakdown = [
                        MetricBreakdown(property=k, value=v)
                        for k, v in combination.items()
                    ]
                    metric_data = [
                        data
                        for data in computed_metric
                        if all(x in data for x in combination.values())
                    ]
                    metric_data = [dict(zip(keys, row)) for row in metric_data]
                    metric_values = [
                        MetricValue(
                            date=data["date"].strftime("%Y-%m-%d"), value=data[func]
                        )
                        for data in metric_data
                    ]
                    series.append(
                        ComputedMetricData(
                            breakdown=metric_breakdown, data=metric_values
                        )
                    )

            computed_metric_steps.append(ComputedMetricStep(name=func, series=series))

        return computed_metric_steps

    async def build_metric(
        self,
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

    async def add_metric(
        self,
        datasource_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: PydanticObjectId,
        name: str,
        function: str,
        aggregates: List[SegmentsAndEvents],
        breakdown: List[str],
    ):
        metric = await self.build_metric(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            function=function,
            aggregates=aggregates,
            breakdown=breakdown,
        )
        metric.updated_at = metric.created_at
        return await Metric.insert(metric)

    async def update_metric(self, metric_id: str, metric: Metric):
        entry = metric.dict()
        entry.pop("id")
        entry.pop("created_at")
        entry["updated_at"] = datetime.utcnow()

        await Metric.find_one(
            Metric.id == PydanticObjectId(metric_id),
        ).update({"$set": entry})

    async def get_metric_by_id(self, metric_id: str):
        return await Metric.find_one(Metric.id == PydanticObjectId(metric_id))

    async def get_metrics_by_app_id(self, app_id: str):
        return await Metric.find(Metric.app_id == PydanticObjectId(app_id)).to_list()

    async def get_metrics_by_user_id(self, user_id: str):
        return await Metric.find(Metric.user_id == PydanticObjectId(user_id)).to_list()

    async def get_metrics_for_datasource_id(self, datasource_id: str) -> List[Metric]:
        return await Metric.find(
            PydanticObjectId(datasource_id) == Metric.datasource_id
        ).to_list()
