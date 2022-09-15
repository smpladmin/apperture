from pydantic import BaseModel


class CreateRunLogDto(BaseModel):
    datasource_id: str
    date: str
