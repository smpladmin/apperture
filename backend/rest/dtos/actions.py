from typing import List, Optional

from pydantic import BaseModel

from domain.actions.models import Action, ActionGroup, CaptureEvent, ComputedAction
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse


class CreateActionDto(BaseModel):
    datasourceId: str
    name: str
    groups: List[ActionGroup]
    eventType: CaptureEvent


class ActionResponse(Action, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class ActionWithUser(Action, ModelResponse):
    user: Optional[AppertureUserResponse]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class TransientActionDto(BaseModel):
    datasourceId: str
    groups: List[ActionGroup]
    eventType: CaptureEvent


class ComputedActionResponse(ComputedAction):
    class Config:
        allow_population_by_field_name = True
