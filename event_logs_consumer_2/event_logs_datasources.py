from apperture.backend_action import get
from models.models import EventLogsDatasourcesBucket


class EventLogsDatasources:
    def __init__(self):
        self.datasource_with_credentials: dict[str, EventLogsDatasourcesBucket] = {}
        self.topics = []

    def get_event_logs_datasources(self):
        event_logs_datasources = get(
            path="/private/datasources?provider=event_logs"
        ).json()

        for datasource in event_logs_datasources:
            topic = f"eventlogs_{datasource['_id']}_1"
            if not self.datasource_with_credentials.get(topic):
                integration = get(
                    path=f"/private/integrations/{datasource['integrationId']}"
                ).json()
                app = get(path=f"/private/apps/{datasource['appId']}").json()
                self.topics.append(topic)
                self.datasource_with_credentials[topic] = EventLogsDatasourcesBucket(
                    data=[],
                    ch_db=app["clickhouseCredential"]["databasename"],
                    ch_table=integration["credential"]["tableName"],
                    ch_server_credential=app["remoteConnection"],
                    app_id=datasource["appId"],
                )
