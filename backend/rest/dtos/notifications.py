from typing import List, Dict, Optional, Set
from pydantic import BaseModel
from rest.dtos.model_response import ModelResponse
from domain.notifications.models import (
    Notification,
    ComputedNotification,
    ThresholdMap,
    NotificationChannel,
    NotificationType,
    NotificationFrequency,
    NotificationMetric,
    NotificationVariant,
)
from rest.dtos.apperture_users import AppertureUserResponse


class CreateNotificationDto(BaseModel):
    datasourceId: str
    name: str
    notificationType: Set[NotificationType]
    metric: NotificationMetric
    multiNode: bool
    appertureManaged: bool
    pctThresholdActive: bool
    pctThresholdValues: Optional[ThresholdMap]
    absoluteThresholdActive: bool
    absoluteThresholdValues: Optional[ThresholdMap]
    formula: str
    variableMap: Dict
    frequency: NotificationFrequency
    preferredHourGMT: int
    preferredChannels: List[NotificationChannel]
    notificationActive: bool
    variant: NotificationVariant
    reference: str


class NotificationResponse(Notification, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class ComputedNotificationResponse(ComputedNotification, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class TriggerNotificationsDto(BaseModel):
    notification_type: str
    frequency: str


class NotificationWithUser(Notification, ModelResponse):
    user: Optional[AppertureUserResponse]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
