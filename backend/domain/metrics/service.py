from datetime import datetime, timedelta
from typing import List, Union
from beanie import PydanticObjectId
from fastapi import Depends

from domain.metrics.models import (
    SegmentsAndEvents,
    ComputedMetricStep,
    MetricBreakdown,
    MetricValue,
    ComputedMetricData,
    Metric,
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
        if not formula:
            return True
        parser = FormulaParser()
        for expression in formula.split(","):
            if not parser.validate_formula(
                expression=expression.strip(), variable_list=variable_list
            ):
                return False
        return True

    def date_range(self, start_date, end_date):
        for n in range(int((end_date - start_date).days + 1)):
            yield start_date + timedelta(n)

    async def compute_metric(
        self,
        datasource_id: str,
        function: str,
        aggregates: List[SegmentsAndEvents],
        breakdown: List[str],
        start_date: Union[str, None],
        end_date: Union[str, None],
    ) -> List[ComputedMetricStep]:
        computed_metric = self.metric.compute_query(
            datasource_id=datasource_id,
            aggregates=aggregates,
            breakdown=breakdown,
            function=function,
            start_date=start_date,
            end_date=end_date,
        )
        if computed_metric is None:
            return [
                ComputedMetricStep(name=func, series=[]) for func in function.split(",")
            ]
        keys = ["date"]
        keys.extend(breakdown + function.split(","))

        dates = list(set(row[0] for row in computed_metric))
        start_date = (
            datetime.strptime(start_date, "%Y-%m-%d") if start_date else min(dates)
        )
        end_date = datetime.strptime(end_date, "%Y-%m-%d") if end_date else max(dates)

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
                metric_values = []

                dates_present = [row["date"] for row in metric_data]
                for single_date in self.date_range(start_date, end_date):
                    if single_date in dates_present:
                        metric_values.append(
                            MetricValue(
                                date=single_date.strftime("%Y-%m-%d"),
                                value=metric_data[dates_present.index(single_date)][
                                    func
                                ],
                            )
                        )
                    else:
                        metric_values.append(
                            MetricValue(date=single_date.strftime("%Y-%m-%d"), value=0)
                        )

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

                    metric_values = []
                    dates_present = [row["date"] for row in metric_data]
                    for single_date in self.date_range(start_date, end_date):
                        if (single_date in dates_present) and metric_data[
                            dates_present.index(single_date)
                        ][func]:
                            metric_values.append(
                                MetricValue(
                                    date=single_date.strftime("%Y-%m-%d"),
                                    value=metric_data[dates_present.index(single_date)][
                                        func
                                    ],
                                )
                            )
                        else:
                            metric_values.append(
                                MetricValue(
                                    date=single_date.strftime("%Y-%m-%d"), value=0
                                )
                            )

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
