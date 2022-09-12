from pydantic import BaseModel


class DataProcessorEnqueueDto(BaseModel):
    datasource_ids: list[str]
