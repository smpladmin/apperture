from pydantic import BaseModel


class ScheduleJobForDatasourceDto(BaseModel):
    name: str
    description: str = ""
    cron: str
