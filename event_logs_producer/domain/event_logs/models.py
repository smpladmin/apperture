from datetime import datetime
from pydantic import BaseModel


class EventLogsDto(BaseModel):
    event: str
    key: str
    data: dict
    added_time: str
