from typing import List, Dict, Optional
from pydantic import BaseModel
from rest.dtos.model_response import ModelResponse
from domain.notifications.models import (
    Notification,
    ComputedNotification,
    ThresholdMap,
    NotificationChannel,
)


class CreateNotificationDto(BaseModel):
    datasourceId: str
    name: str
    notificationType: str
    appertureManaged: bool
    pctThresholdActive: bool
    pctThresholdValues: Optional[ThresholdMap]
    absoluteThresholdActive: bool
    absoluteThresholdValues: Optional[ThresholdMap]
    formula: str
    variableMap: Dict
    frequency: str
    preferredHourGMT: int
    preferredChannels: List[NotificationChannel]
    notificationActive: bool


class NotificationResponse(Notification, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class ComputedNotificationResponse(ComputedNotification, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class TriggerNotificationsDto(BaseModel):
    notification_type: str
    frequency: str
