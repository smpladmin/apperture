from typing import Optional, Union
from pydantic import BaseModel
from domain.alerts.models import Threshold, FrequencyAlertMeta
from domain.alerts.models import Alert, AlertType, EmailChannel, Schedule, SlackChannel
from rest.dtos.model_response import ModelResponse


class AlertDto(BaseModel):
    datasourceId: str
    userId: str
    type: AlertType
    table: Optional[str]
    schedule: Optional[Schedule]
    threshold: Optional[Threshold]
    frequencyAlert: Optional[FrequencyAlertMeta]
    channel: Union[SlackChannel, EmailChannel]


class AlertResponse(Alert, ModelResponse):
    class Config:
        allow_population_by_field_name = True
