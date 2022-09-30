from pydantic import BaseModel


class ScheduleJobForDatasourceDto(BaseModel):
    datasource_id: str
