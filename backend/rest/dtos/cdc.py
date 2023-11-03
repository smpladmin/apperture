from domain.common.models import IntegrationProvider
from domain.integrations.models import CdcCredential
from rest.dtos.model_response import ModelResponse
from domain.apps.models import ClickHouseCredential
from beanie import PydanticObjectId


class CdcCredentials(ModelResponse):
    id: PydanticObjectId
    app_id: PydanticObjectId
    provider: IntegrationProvider
    cdc_credential: CdcCredential
    clickhouse_credential: ClickHouseCredential

    class Config:
        allow_population_by_field_name = True
