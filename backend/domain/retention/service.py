from typing import Union

from beanie import PydanticObjectId
from fastapi import Depends

from domain.common.date_models import DateFilter
from domain.common.filter_models import EventSelection
from domain.metrics.models import SegmentFilter
from domain.retention.models import TrendScale, Granularity
from mongo import Mongo
from repositories.clickhouse.retention import Retention


class RetentionService:
    def __init__(
        self,
        retention: Retention = Depends(),
        mongo: Mongo = Depends(),
    ):
        self.retention = retention
        self.mongo = mongo

    async def compute_retention(
        self,
        datasource_id: str,
        start_event: EventSelection,
        goal_event: EventSelection,
        date_filter: DateFilter,
        segment_filter: Union[SegmentFilter, None],
        trend_scale: TrendScale,
        granularity: Granularity,
        interval: int,
    ):
        pass
