from typing import Optional
from pydantic import BaseModel


class TestQueryDto(BaseModel):
    datasource_id: str
    query: str
