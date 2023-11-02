from apperture.backend_action import get
from models.models import Integration


class CDCIntegrations:
    def __init__(self):
        self.integrations = []
        self.topics = []
        self.cdc_buckets = {}

    def get_cdc_integrations(self):
        self.integrations = [
            Integration(**integration)
            for integration in get(path="/private/integrations/cdc").json()
        ]

        for integration in self.integrations:
            cdc_cred = integration.cdcCredential
            tables = cdc_cred.tables.split(",")
            tables = [table.strip() for table in tables]
            for table in tables:
                topic = f"cdc_{integration.id}.{cdc_cred.database}.{table}"
                self.topics.append(topic)
                self.cdc_buckets[topic] = {
                    "data": [],
                    "ch_db": integration.clickhouseCredential.databasename,
                    "ch_table": f"cdc_{table.replace('.', '_')}",
                }
