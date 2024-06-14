from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime


class Frequency(str, Enum):
    QUARTER_HOURLY = "quarter_hourly"
    HALF_HOURLY = "half_hourly"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class Schedule(BaseModel):
    time: Optional[str]
    period: Optional[str]
    date: Optional[str]
    day: Optional[str]
    frequency: Frequency


class SlackChannel(BaseModel):
    alert_name: Optional[str]
    slack_url: Optional[str]


class QueriesSchedule(BaseModel):
    id: str = Field(alias="_id")
    query_ids: List[str]
    key_columns: List[str]
    compare_columns: Dict[str, str]
    schedule: Schedule
    channel: Optional[SlackChannel]
    created_at: datetime
    enabled: bool = True
