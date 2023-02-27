from datetime import datetime
from typing import List, Optional, Union

import pandas as pd
from beanie import PydanticObjectId
from fastapi import Depends

from domain.metrics.models import (
    ComputedMetricResult,
    Metric,
    SegmentsAndEvents,
    SegmentsAndEventsType,
)
from mongo import Mongo
from repositories.clickhouse.metric import Metrics
from repositories.clickhouse.parser.formula_parser import FormulaParser


class MetricService:
    def __init__(
        self,
        metric: Metrics = Depends(),
        mongo: Mongo = Depends(),
    ):
        self.metric = metric
        self.mongo = mongo

    def validate_formula(self, formula, variable_list):
        parser = FormulaParser()
        for expression in formula.split(","):
            if not parser.validate_formula(
                expression=expression, variable_list=variable_list
            ):
                return False
        return True

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
        if computed_metric is None:
            return ComputedMetricResult(metric=[], average={})
        keys = ["date", *function.split(",")]
        data = [dict(zip(keys, row)) for row in computed_metric]
        result = [
            {"date": d["date"], "series": k, "value": v}
            for d in data
            for k, v in d.items()
            if k != "date"
        ]
        df = pd.DataFrame(data)
        average = df[function.split(",")].mean().to_dict()
        return ComputedMetricResult(metric=result, average=average)

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
