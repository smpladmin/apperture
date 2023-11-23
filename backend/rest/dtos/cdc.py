from typing import Union
from beanie import PydanticObjectId
from domain.common.models import IntegrationProvider
from domain.integrations.models import CdcCredential
from rest.dtos.model_response import ModelResponse
from domain.apps.models import ClickHouseCredential, ClickHouseRemoteConnectionCreds


class CdcCredentials(ModelResponse):
    id: PydanticObjectId
    app_id: PydanticObjectId
    provider: IntegrationProvider
    cdc_credential: CdcCredential
    clickhouse_credential: ClickHouseCredential
    remote_connection: Union[ClickHouseRemoteConnectionCreds, None]

    class Config:
        allow_population_by_field_name = True
