from pydantic import BaseModel


class ScheduleJobForDatasourceDto(BaseModel):
    name: str
    description: str = ""
    job_name: str
    cron: str
    args: list[str] = []
