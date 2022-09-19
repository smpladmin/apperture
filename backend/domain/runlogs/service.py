from datetime import datetime
import os
from dateutil.parser import parse
from beanie import PydanticObjectId
from dateutil.relativedelta import relativedelta

from domain.runlogs.models import RunLog, RunLogStatus


class RunLogService:
    async def update(self, datasource_id: str, date: datetime, status: RunLogStatus):
        runlog = await RunLog.find_one(
            RunLog.datasource_id == PydanticObjectId(datasource_id),
            RunLog.date == date,
        )
        if not runlog:
            return
        runlog.status = status
        await runlog.save()
        return runlog

    async def create_runlogs(self, datasource_id: PydanticObjectId):
        today = datetime.utcnow()
        max_runlog_days = int(os.getenv("MAX_RUNLOG_DAYS", 2))
        dates = [
            (today - relativedelta(days=d)).replace(
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
            for d in range(1, max_runlog_days + 1)
        ]
        runlogs = [
            RunLog(datasource_id=datasource_id, date=d, status=RunLogStatus.SCHEDULED)
            for d in dates
        ]
        for runlog in runlogs:
            runlog.updated_at = runlog.created_at
        await RunLog.insert_many(runlogs)
        return await RunLog.find(RunLog.datasource_id == datasource_id).to_list()
