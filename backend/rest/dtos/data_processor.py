from pydantic import BaseModel


class DataProcessorEnqueueDto(BaseModel):
    datasourceIds: list[str]


class DataSourceDto(BaseModel):
    id: str
    date: str


class EventsDataProcessorEnqueueDto(BaseModel):
    datasources: list[DataSourceDto]
