from typing import List

from pydantic import BaseModel

from domain.actions.models import ActionGroup, Action
from rest.dtos.model_response import ModelResponse


class CreateActionDto(BaseModel):
    datasourceId: str
    name: str
    groups: List[ActionGroup]


class ActionResponse(Action, ModelResponse):
    class Config:
        allow_population_by_field_name = True
