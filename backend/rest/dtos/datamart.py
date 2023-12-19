from typing import List, Optional, Union

from pydantic import BaseModel

from domain.datamart.models import DataMart
from domain.datamart_actions.models import DatamartAction
from rest.dtos.apperture_users import AppertureUserResponse
from rest.dtos.datamart_actions import DatamartActionResponse
from rest.dtos.model_response import ModelResponse


class DataMartTableDto(BaseModel):
    datasourceId: str
    name: str
    query: str


class DataMartResponse(DataMart, ModelResponse):
    class Config:
        allow_population_by_field_name = True


class DataMartWithUser(DataMart, ModelResponse):
    user: Optional[AppertureUserResponse]
    actions: Optional[List[DatamartActionResponse]]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class RefreshDataMartDto(BaseModel):
    appId: str
