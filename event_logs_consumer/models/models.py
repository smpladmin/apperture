from typing import Optional
from pydantic import BaseModel


class ClickHouseCredentials(BaseModel):
    host: str
    port: int
    username: str
    password: str


class EventLogsDatasourcesBucket(BaseModel):
    data: list
    ch_db: str
    ch_table: str
    ch_server_credential: Optional[str]
    app_id: str
