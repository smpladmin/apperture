from enum import Enum
from typing import Optional
from pydantic import BaseModel


class NotificationType(str, Enum):
    ALERT = "alert"
    UPDATE = "update"


class NotificationFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"


class NotificationChannel(str, Enum):
    SLACK = "slack"
    EMAIL = "email"


class ThresholdMap(BaseModel):
    min: float
    max: float


class NotificationThresholdType(str, Enum):
    PCT = "pct"
    ABSOLUTE = "absolute"


class Notification(BaseModel):
    name: str
    notificationType: NotificationType
    value: float
    thresholdType: Optional[NotificationThresholdType]
    userThreshold: Optional[ThresholdMap]
    triggered: Optional[bool]
