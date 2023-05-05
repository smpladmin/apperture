from typing import List, Optional

from pydantic import BaseModel

from domain.actions.models import Action, ActionGroup, CaptureEvent, ComputedAction
from domain.common.date_models import DateFilter
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse


class CreateActionDto(BaseModel):
    datasourceId: str
    name: str
    groups: List[ActionGroup]


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
    dateFilter: Optional[DateFilter]


class ComputedActionResponse(ComputedAction):
    class Config:
        allow_population_by_field_name = True
