from typing import Union
from pandas import DataFrame
from pydantic import BaseModel


class ClickHouseCredentials(BaseModel):
    host: str
    port: int
    username: str
    password: str


class EventTablesBucket(BaseModel):
    data: DataFrame
    audit_data: DataFrame
    ch_db: str
    ch_table: str
    ch_server_credential: Union[ClickHouseCredentials, None]
    app_id: str
    table_config: list
    columns_with_types: dict
    primary_key: str
    save_to_audit_table: bool

    class Config:
        arbitrary_types_allowed = True
