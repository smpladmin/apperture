from beanie import PydanticObjectId
from domain.runlogs.models import RunLog


class RunLogService:
    async def create(datasource_id: str, date: str):
        runlog = RunLog(datasource_id=PydanticObjectId(datasource_id), date=date)
        await runlog.insert()
        return runlog
