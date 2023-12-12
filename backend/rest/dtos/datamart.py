from typing import Optional, Union

from pydantic import BaseModel

from domain.datamart.models import DataMart
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.model_response import ModelResponse
from domain.spreadsheets.models import DatabaseClient
from domain.apps.models import ClickHouseCredential
from domain.integrations.models import MsSQLCredential, MySQLCredential


class DataMartTableDto(BaseModel):
    datasourceId: str
    name: str
    query: str


class DataMartResponse(DataMart, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class DataMartWithUser(DataMart, ModelResponse):
    user: Optional[AppertureUserResponse]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class DataMartDto(BaseModel):
    datamartId: str
    appId: str
    databaseCredential: Union[ClickHouseCredential, MySQLCredential, MsSQLCredential]
    databaseClient: DatabaseClient


class RefreshDataMartDto(BaseModel):
    appId: str
