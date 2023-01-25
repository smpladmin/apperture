import datetime
from typing import List, Union

from pydantic import BaseModel


class Event(BaseModel):
    name: str
    timestamp: datetime.datetime
    user_id: str
    city: str


class AuxTable1Event(BaseModel):
    name: str
    timestamp: datetime.datetime
    user_id: str
    reviewed_by: str = "Lea Marcos"


class AuxTable2Event(BaseModel):
    user_id: str
    income: str


class EventsData(BaseModel):
    count: int
    data: Union[List[Event], List[AuxTable1Event], List[AuxTable2Event]]
