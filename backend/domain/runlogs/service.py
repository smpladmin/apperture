from datetime import datetime
from dateutil.parser import parse
from beanie import PydanticObjectId

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
