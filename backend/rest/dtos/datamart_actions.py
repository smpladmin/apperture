from typing import Union

from pydantic import BaseModel


from domain.datamart_actions.models import (
    APIMeta,
    ActionType,
    DatamartAction,
    GoogleSheetMeta,
    TableMeta,
    Schedule,
)
from rest.dtos.model_response import ModelResponse
from domain.spreadsheets.models import DatabaseClient
from domain.apps.models import ClickHouseCredential
from domain.integrations.models import MsSQLCredential, MySQLCredential


class PushDatamartDto(BaseModel):
    datamartId: str
    meta: Union[GoogleSheetMeta, APIMeta, TableMeta]
    type: ActionType


class RefreshTableActionDto(BaseModel):
    datamartId: str
    tableName: str
    appId: str
    databaseCredential: Union[ClickHouseCredential, MySQLCredential, MsSQLCredential]
    databaseClient: DatabaseClient


class DatamartActionsDto(BaseModel):
    datamartId: str
    type: ActionType
    schedule: Schedule
    meta: Union[GoogleSheetMeta, APIMeta, TableMeta]


class DatamartActionsResponse(DatamartAction, ModelResponse):
    class Config:
        allow_population_by_field_name = True
