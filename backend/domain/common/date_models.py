from enum import Enum

from pydantic import BaseModel


class DateFilterType(str, Enum):
    FIXED = "fixed"
    SINCE = "since"
    LAST = "last"


class FixedDateFilter(BaseModel):
    start_date: str
    end_date: str


class SinceDateFilter(BaseModel):
    start_date: str


class LastDateFilter(BaseModel):
    days: int
