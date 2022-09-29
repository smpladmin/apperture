from typing import List, Dict
from pydantic import BaseModel
from domain.notifications.models import Notification
from rest.dtos.model_response import ModelResponse


class CreateNotificationDto(BaseModel):
    datasourceId: str
    notificationType: str
    appertureManaged: bool
    pctThresholdActive: bool
    pctThresholdValues: List[float]
    absoluteThresholdActive: bool
    absoluteThresholdValues: List[float]
    formula: str
    variableMap: Dict
    frequency: str
    preferredHourGMT: int
    preferredChannels: List[str]
    notificationActive: bool


class NotificationResponse(Notification, ModelResponse):
    class Config:
        allow_population_by_field_name = True
