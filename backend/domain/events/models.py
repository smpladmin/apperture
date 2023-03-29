import datetime
from typing import List, Union, Optional

from pydantic import BaseModel


class Event(BaseModel):
    name: str
    timestamp: datetime.datetime
    user_id: Optional[str]
    city: Optional[str]


class AuxTable1Event(BaseModel):
    name: str
    timestamp: datetime.datetime
    user_id: str
    reviewed_by: str = "Lea Marcos"


class AuxTable2Event(BaseModel):
    user_id: str
    salary_basic: str


class EventsData(BaseModel):
    count: int
    offset: Optional[int]
    data: Union[List[Event], List[AuxTable1Event], List[AuxTable2Event]]
