from repositories import Document
from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum


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


class QueriesSchedule(Document):
    query_ids: List[str]
    key_columns: List[str]
    compare_columns: Dict[str, str]
    schedule: Schedule
    channel: SlackChannel
    enabled: bool = True

    class Settings:
        name = "queries_schedules"
