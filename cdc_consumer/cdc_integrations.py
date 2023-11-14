from typing import Union
from apperture.backend_action import get
from models.models import CdcIntegration, ClickHouseRemoteConnectionCred


class CDCIntegrations:
    def __init__(self):
        self.integrations = []
        self.topics = []
        self.cdc_buckets = {}

    def get_clickhouse_server_credentials_for_app(
        self, app_id: str
    ) -> Union[ClickHouseRemoteConnectionCred, None]:
        response = get(f"/private/apps/clickhouse_server_credential/{app_id}")
        return (
            ClickHouseRemoteConnectionCred(**response.json())
            if response.json()
            else None
        )

    def get_cdc_integrations(self):
        self.integrations = [
            CdcIntegration(**cdc_integration)
            for cdc_integration in get(path="/private/cdc").json()
        ]

        for integration in self.integrations:
            cdc_cred = integration.cdcCredential
            for table in cdc_cred.tables:
                topic = f"cdc_{integration.id}.{cdc_cred.database}.dbo.{table}"
                self.topics.append(topic)
                self.cdc_buckets[topic] = {
                    "data": [],
                    "shard": cdc_cred.database,
                    "ch_db": integration.clickhouseCredential.databasename,
                    "ch_table": f"cdc_{table}",
                    "ch_server_credential": self.get_clickhouse_server_credentials_for_app(
                        app_id=integration.appId
                    ),
                    "app_id": integration.appId,
                }
