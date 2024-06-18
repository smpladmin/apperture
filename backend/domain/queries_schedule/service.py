from datetime import datetime

from beanie import PydanticObjectId
from fastapi import Depends

from rest.dtos.queries_schedule import QueryScheduleDto
from domain.queries_schedule.models import QueriesSchedule
from mongo import Mongo
from typing import List

from fastapi import Depends


class QueriesScheduleService:
    def __init__(self, mongo: Mongo = Depends()):
        self.mongo = mongo

    def build_queries_schedule(self, dto: QueryScheduleDto) -> QueriesSchedule:
        now = datetime.now()
        return QueriesSchedule(
            query_ids=dto.query_ids,
            key_columns=dto.key_columns,
            compare_columns=dto.compare_columns,
            schedule=dto.schedule,
            channel=dto.channel,
        )

    async def save_queries_schedule(self, schedule: QueriesSchedule):
        return await QueriesSchedule.insert(schedule)

    async def get_queries_schedule_data(self, id: str):
        return await QueriesSchedule.find_one({"_id": PydanticObjectId(id)})

    async def get_all_query_schedules(self) -> List[QueriesSchedule]:
        data = await QueriesSchedule.find(QueriesSchedule.enabled == True).to_list()
        return data
