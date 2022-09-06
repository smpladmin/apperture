from beanie import PydanticObjectId
from pydantic import BaseModel, Field
from domain.datasources.models import DataSource, DataSourceVersion
from rest.dtos.model_response import ModelResponse


class DataSourceResponse(DataSource, ModelResponse):
    pass


class CreateDataSourceDto(BaseModel):
    externalSourceId: str
    name: str
    version: DataSourceVersion
