from typing import List, Dict
from pydantic import BaseModel


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
