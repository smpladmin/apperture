from typing import Optional, Union
from pydantic import BaseModel
from domain.alerts.models import Alert, AlertType, EmailChannel, Schedule, SlackChannel
from rest.dtos.model_response import ModelResponse


class AlertDto(BaseModel):
    datasourceId: str
    type: AlertType
    schedule: Optional[Schedule]
    channel: Union[SlackChannel, EmailChannel]


class AlertResponse(Alert, ModelResponse):
    class Config:
        allow_population_by_field_name = True
