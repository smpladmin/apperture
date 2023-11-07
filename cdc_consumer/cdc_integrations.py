from apperture.backend_action import get
from models.models import CdcIntegration


class CDCIntegrations:
    def __init__(self):
        self.integrations = []
        self.topics = []
        self.cdc_buckets = {}

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
                    "ch_db": integration.clickhouseCredential.databasename,
                    "ch_table": f"cdc_{table}",
                    "data_types": [],
                }
