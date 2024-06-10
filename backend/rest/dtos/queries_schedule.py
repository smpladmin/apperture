from typing import List, Dict, Optional
from enum import Enum
from pydantic import BaseModel
from domain.queries_schedule.models import QueriesSchedule
from rest.dtos.model_response import ModelResponse


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
    slack_channel: Optional[str]
    slack_url: Optional[str]


class QueryScheduleDto(BaseModel):
    query_ids: List[str]
    key_columns: List[str]
    compare_columns: Dict[str, str]
    schedule: Schedule
    channel: SlackChannel


class QueriesScheduleResponse(QueriesSchedule, ModelResponse):
    class Config:
        allow_population_by_field_name = True
