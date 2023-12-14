from typing import Union

from pydantic import BaseModel


from domain.datamart_actions.models import (
    APIMeta,
    ActionType,
    DatamartActions,
    GoogleSheetMeta,
    Schedule,
    TableMeta,
)
from rest.dtos.model_response import ModelResponse


class PushDatamartDto(BaseModel):
    datamartId: str
    meta: Union[GoogleSheetMeta, APIMeta, TableMeta]
    type: ActionType


class DatamartActionsDto(BaseModel):
    datamartId: str
    type: ActionType
    schedule: Schedule
    meta: Union[GoogleSheetMeta, APIMeta, TableMeta]


class DatamartActionsResponse(DatamartActions, ModelResponse):
    class Config:
        allow_population_by_field_name = True
