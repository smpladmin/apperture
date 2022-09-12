from pydantic import BaseModel


class DataProcessorEnqueueDto(BaseModel):
    datasourceIds: list[str]
