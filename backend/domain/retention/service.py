from datetime import datetime
from typing import List, Union

from beanie import PydanticObjectId
from beanie.odm.operators.find.comparison import In
from fastapi import Depends

from domain.common.date_models import DateFilter
from domain.common.date_utils import DateUtils
from domain.metrics.models import SegmentFilter
from domain.retention.models import (
    ComputedRetention,
    EventSelection,
    Granularity,
    Retention,
)
from mongo import Mongo
from repositories.clickhouse.retention import Retention as RetentionRepository
from repositories.clickhouse.segments import Segments


class RetentionService:
    def __init__(
        self,
        retention: RetentionRepository = Depends(),
        mongo: Mongo = Depends(),
        segment: Segments = Depends(),
        date_utils: DateUtils = Depends(),
    ):
        self.retention = retention
        self.mongo = mongo
        self.segment = segment
        self.date_utils = date_utils

    async def compute_retention(
        self,
        datasource_id: str,
        app_id: str,
        start_event: EventSelection,
        goal_event: EventSelection,
        date_filter: DateFilter,
        segment_filter: Union[List[SegmentFilter], None],
        granularity: Granularity,
    ) -> List[ComputedRetention]:
        start_date, end_date = self.date_utils.compute_date_filter(
            date_filter=date_filter.filter, date_filter_type=date_filter.type
        )

        segment_filter_criterion = (
            self.segment.build_segment_filter_on_metric_criterion(
                segment_filter=segment_filter
            )
            if segment_filter
            else None
        )

        retention_trend_query_response = await self.retention.compute_retention(
            datasource_id=datasource_id,
            app_id=app_id,
            start_event=start_event,
            goal_event=goal_event,
            start_date=start_date,
            end_date=end_date,
            segment_filter_criterion=segment_filter_criterion,
            granularity=granularity,
        )
        return [
            ComputedRetention(
                granularity=datetime.combine(
                    goal_event_granularity, datetime.min.time()
                ),
                interval=interval,
                initial_users=initial_users,
                retained_users=retained_users,
                retention_rate="{:.2f}".format((retained_users / initial_users) * 100),
                interval_name=f"{granularity.value[:-1]} {interval}",
            )
            for (
                goal_event_granularity,
                interval,
                retained_users,
                start_event_granularity,
                initial_users,
            ) in retention_trend_query_response
        ]

    def build_retention(
        self,
        datasource_id: PydanticObjectId,
        app_id: PydanticObjectId,
        user_id: str,
        name: str,
        start_event: EventSelection,
        goal_event: EventSelection,
        granularity: Granularity,
        date_filter: DateFilter,
        segment_filter: Union[DateFilter, None],
    ) -> Retention:
        return Retention(
            datasource_id=datasource_id,
            app_id=app_id,
            user_id=user_id,
            name=name,
            start_event=start_event,
            goal_event=goal_event,
            granularity=granularity,
            date_filter=date_filter,
            segment_filter=segment_filter,
        )

    async def add_retention(self, retention: Retention):
        retention.updated_at = retention.created_at
        await Retention.insert(retention)

    async def get_retention(self, id: str) -> Retention:
        return await Retention.get(PydanticObjectId(id))

    async def update_retention(self, retention_id: str, new_retention: Retention):
        to_update = new_retention.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await Retention.find_one(
            Retention.id == PydanticObjectId(retention_id),
        ).update({"$set": to_update})

    async def get_retentions_for_apps(
        self, app_ids: List[PydanticObjectId]
    ) -> List[Retention]:
        return await Retention.find(
            In(Retention.app_id, app_ids),
            Retention.enabled != False,
        ).to_list()

    async def get_retentions_for_datasource_id(
        self, datasource_id: str
    ) -> List[Retention]:
        return await Retention.find(
            Retention.datasource_id == PydanticObjectId(datasource_id),
            Retention.enabled != False,
        ).to_list()

    async def get_retentions_for_user_id(
        self, user_id: PydanticObjectId
    ) -> List[Retention]:
        return await Retention.find(
            Retention.user_id == user_id,
            Retention.enabled != False,
        ).to_list()

    async def delete_retention(self, retention_id: str):
        await Retention.find_one(
            Retention.id == PydanticObjectId(retention_id),
        ).update({"$set": {"enabled": False}})
        return
