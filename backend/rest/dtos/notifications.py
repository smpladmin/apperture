from typing import List, Dict
from pydantic import BaseModel
from rest.dtos.model_response import ModelResponse
from domain.notifications.models import Notification, ComputedNotification


class CreateNotificationDto(BaseModel):
    datasourceId: str
    notificationType: str
    appertureManaged: bool
    pctThresholdActive: bool
    pctThresholdValues: Dict
    absoluteThresholdActive: bool
    absoluteThresholdValues: Dict
    formula: str
    variableMap: Dict
    frequency: str
    preferredHourGMT: int
    preferredChannels: List[str]
    notificationActive: bool


class NotificationResponse(Notification, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class ComputedNotificationResponse(ComputedNotification, ModelResponse):
    class Config:
        allow_population_by_field_name = True
