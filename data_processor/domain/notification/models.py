from enum import Enum
from typing import Optional
from pydantic import BaseModel


class NotificationChannel(str, Enum):
    SLACK = "slack"
    EMAIL = "email"


class Notification(BaseModel):
    name: str
    value: float
    pctChange: Optional[float]
    metric: Optional[str]
    userThreshold: Optional[float]
