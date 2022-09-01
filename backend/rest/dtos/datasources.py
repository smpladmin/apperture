from domain.datasources.models import DataSource
from rest.dtos.model_response import ModelResponse


class DataSourceResponse(DataSource, ModelResponse):
    pass
