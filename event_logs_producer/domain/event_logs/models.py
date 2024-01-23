from typing import Optional, Union
from pydantic import BaseModel


class Event(BaseModel):
    eventName: str
    addedTime: str
    table: str
    mobile: Optional[str]
    task_id: Optional[str]
    account_id: Optional[str]
    key: Optional[str]
    data: dict


class EventLogsDto(BaseModel):
    event: Event
