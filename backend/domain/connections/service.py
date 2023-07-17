from typing import List

from domain.connections.models import ConnectionGroup, Connections, ConnectionSource
from domain.datasources.models import DataSource


class ConnectionService:
    def get_connections_from_datasources(
        self, datasources: List[DataSource], properties_table: dict
    ):
        connection_table = {}
        for index, datasource in enumerate(datasources):
            if datasource.provider not in connection_table:
                connection_table[datasource.provider] = []
            connection_table[datasource.provider].append(datasource)
        connection_data = []
        for key, value in connection_table.items():
            group = ConnectionGroup(provider=key, connection_source=[])
            for datasource in value:
                fields = [
                    "properties." + property
                    for property in (properties_table[str(datasource.id)] or [])
                ]
                group.connection_source.append(
                    ConnectionSource(
                        name=datasource.name
                        or datasource.external_source_id
                        or datasource.provider,
                        fields=["event_name", "user_id", *fields],
                        datasource_id=datasource.id,
                        table_name="events",
                        database_name="default",
                    )
                )
            connection_data.append(group)
        return Connections(server="ClickHouse", connection_data=connection_data)
