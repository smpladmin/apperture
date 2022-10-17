from enum import Enum
from typing import List, Dict, Optional
from pydantic import BaseModel
from beanie import PydanticObjectId
from repositories.document import Document


class NotificationType(str, Enum):
    ALERT = "alert"
    UPDATE = "update"


class NotificationFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"


class NotificationChannel(str, Enum):
    SLACK = "slack"
    EMAIL = "email"


class NotificationThresholdType(str, Enum):
    PCT = "pct"
    ABSOLUTE = "absolute"


class ThresholdMap(BaseModel):
    min: float
    max: float


class Notification(Document):
    datasource_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    notification_type: NotificationType
    apperture_managed: bool
    pct_threshold_active: bool
    pct_threshold_values: Optional[ThresholdMap]
    absolute_threshold_active: bool
    absolute_threshold_values: Optional[ThresholdMap]
    formula: str
    variable_map: Dict
    preferred_hour_gmt: int
    frequency: NotificationFrequency
    preferred_channels: List[NotificationChannel]
    notification_active: bool

    class Settings:
        name = "notifications"


class ComputedNotification(BaseModel):
    name: str
    notification_id: PydanticObjectId
    value: float
    threshold_type: Optional[NotificationThresholdType]
    user_threshold: Optional[ThresholdMap]
    triggered: Optional[bool]
