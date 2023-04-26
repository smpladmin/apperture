from datetime import datetime, timedelta
import logging
from typing import List, Union
from beanie import PydanticObjectId
from fastapi import Depends
from domain.notifications.models import NotificationVariant

from domain.common.date_models import DateFilter, DateFilterType
from domain.common.date_utils import DateUtils
from domain.metrics.models import (
    SegmentsAndEvents,
    ComputedMetricStep,
    MetricBreakdown,
    MetricValue,
    ComputedMetricData,
    Metric,
    SegmentFilter,
)
from domain.notifications.models import (
    Notification,
    NotificationData,
    NotificationThresholdType,
)
from mongo import Mongo
from repositories.clickhouse.metric import Metrics
from repositories.clickhouse.parser.formula_parser import FormulaParser
from repositories.clickhouse.segments import Segments


class MetricService:
    def __init__(
        self,
        metric: Metrics = Depends(),
        segment: Segments = Depends(),
        mongo: Mongo = Depends(),
        date_utils: DateUtils = Depends(),
    ):
        self.metric = metric
        self.segment = segment
        self.mongo = mongo
        self.date_utils = date_utils

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
        date_filter: Union[DateFilter, None],
        segment_filter: Union[List[SegmentFilter], None],
    ) -> List[ComputedMetricStep]:

        start_date, end_date = (
            self.date_utils.compute_date_filter(
                date_filter=date_filter.filter, date_filter_type=date_filter.type
            )
            if date_filter and date_filter.filter and date_filter.type
            else (None, None)
        )

        segment_filter_criterion = (
            self.segment.build_segment_filter_on_metric_criterion(
                segment_filter=segment_filter
            )
            if segment_filter
            else None
        )

        computed_metric = self.metric.compute_query(
            datasource_id=datasource_id,
            aggregates=aggregates,
            breakdown=breakdown,
            function=function,
            start_date=start_date,
            end_date=end_date,
            segment_filter_criterion=segment_filter_criterion,
        )
        if computed_metric is None:
            return [
                ComputedMetricStep(name=func, series=[]) for func in function.split(",")
            ]
        keys = ["date"]
        keys.extend(breakdown + function.split(","))
        computed_metric_steps = []

        dates = list(set(row[0] for row in computed_metric))
        if not dates:
            return computed_metric_steps

        start_date = (
            datetime.strptime(start_date, "%Y-%m-%d").date()
            if start_date
            else min(dates)
        )
        end_date = (
            datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else max(dates)
        )
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

        for func in function.split(","):
            series = []
            if not breakdown_combinations:
                metric_data = [dict(zip(keys, row)) for row in computed_metric]
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
        date_filter: Union[DateFilter, None],
        segment_filter: Union[List[SegmentFilter], None],
    ):
        return Metric(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            function=function,
            aggregates=aggregates,
            breakdown=breakdown,
            date_filter=date_filter,
            segment_filter=segment_filter,
        )

    async def add_metric(self, metric: Metric):
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
        return await Metric.find(
            Metric.app_id == PydanticObjectId(app_id),
            Metric.enabled != False,
        ).to_list()

    async def get_metrics_by_user_id(self, user_id: str):
        return await Metric.find(
            Metric.user_id == PydanticObjectId(user_id),
            Metric.enabled != False,
        ).to_list()

    async def get_metrics_for_datasource_id(self, datasource_id: str) -> List[Metric]:
        logging.info(f"Getting metrics for datasource {datasource_id}")
        metrics = await Metric.find(
            Metric.datasource_id == PydanticObjectId(datasource_id),
            Metric.enabled != False,
        ).to_list()
        logging.info(f"Found metrics: {metrics}")
        return metrics

    async def delete_metric(self, metric_id: str):
        await Metric.find_one(
            Metric.id == PydanticObjectId(metric_id),
        ).update({"$set": {"enabled": False}})
        return

    async def get_notification_data(self, notification: Notification, days_ago: int):
        metric = await self.get_metric_by_id(notification.reference)

        date = self.date_utils.compute_n_days_ago_date(days_ago=days_ago)

        if (
            metric.date_filter
            and metric.date_filter.type == DateFilterType.FIXED
            and self.date_utils.compare_dates(
                end_date=metric.date_filter.filter.end_date, date=date
            )
        ):
            return -1

        segment_filter_criterion = (
            self.segment.build_segment_filter_on_metric_criterion(
                segment_filter=metric.segment_filter
            )
            if metric.segment_filter
            else None
        )

        data = self.metric.compute_query(
            datasource_id=str(metric.datasource_id),
            aggregates=metric.aggregates,
            breakdown=metric.breakdown,
            function=metric.function,
            start_date=date,
            end_date=date,
            segment_filter_criterion=segment_filter_criterion,
        )

        [(date, users_count)] = data or [(0, 0)]
        logging.info(f"metric {metric.name} users count on {date}: {users_count}")
        return float("{:.2f}".format(users_count))

    async def build_notification_data(self, notification: Notification):
        return NotificationData(
            name=notification.name,
            notification_id=notification.id,
            value=await self.get_notification_data(
                notification=notification, days_ago=1
            ),
            prev_day_value=await self.get_notification_data(
                notification=notification, days_ago=2
            ),
            variant=NotificationVariant.METRIC,
            threshold_type=NotificationThresholdType.PCT
            if notification.pct_threshold_active
            else NotificationThresholdType.ABSOLUTE,
            threshold_value=notification.pct_threshold_values
            if notification.pct_threshold_active
            else notification.absolute_threshold_values,
        )

    async def get_metric_data_for_notifications(
        self, notifications: List[Notification]
    ):
        notifications_data_for_metric = [
            await self.build_notification_data(notification=notification)
            for notification in notifications
        ]
        filtered_notifications_data_for_metric = [
            notification
            for notification in notifications_data_for_metric
            if notification.value != -1
        ]
        return filtered_notifications_data_for_metric
