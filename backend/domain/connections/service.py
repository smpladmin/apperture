from typing import List

from domain.common.models import IntegrationProvider
from domain.connections.models import ConnectionGroup, Connections, ConnectionSource
from domain.datasources.models import DataSource, ProviderDataSource


class ConnectionService:
    def get_clickhouse_connection_group(
        self, clickhouse_connection_table, properties_table
    ):
        connection_data = []
        for key, value in clickhouse_connection_table.items():
            group = ConnectionGroup(provider=key, connection_source=[])
            for datasource in value:
                fields = [
                    "properties." + property
                    for property in (
                        properties_table[str(datasource.id)]["fields"] or []
                    )
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
            connection_data.append(group) if group and group.connection_source else None
        return (
            Connections(server="ClickHouse", connection_data=connection_data)
            if connection_data
            else []
        )

    def get_my_sql_connection_sources(self, datasource: DataSource, details):
        return (
            ConnectionSource(
                name=datasource.name
                or datasource.external_source_id
                or details["table_name"],
                fields=details["fields"] or [],
                datasource_id=datasource.id,
                table_name=details["table_name"],
                database_name=details["database"],
            )
            if details
            else None
        )

    def get_mysql_connection_group(self, mysql_connections, properties_table: dict):
        connection_data = []
        group = ConnectionGroup(
            provider=IntegrationProvider.MYSQL, connection_source=[]
        )
        for datasource in mysql_connections:
            source = self.get_my_sql_connection_sources(
                datasource, properties_table[str(datasource.id)]
            )
            group.connection_source.append(source) if source else None
        connection_data.append(group) if group and group.connection_source else None
        return (
            Connections(server="MySQL", connection_data=connection_data)
            if connection_data
            else []
        )

    def get_connections_from_datasources(
        self, datasources: List[DataSource], properties_table: dict
    ):
        clickhouse_connection_table = {}
        mysql_connections = []
        for datasource in datasources:
            if datasource.provider != IntegrationProvider.MYSQL:
                if datasource.provider not in clickhouse_connection_table:
                    clickhouse_connection_table[datasource.provider] = []
                clickhouse_connection_table[datasource.provider].append(datasource)
            else:
                mysql_connections.append(datasource)
        clickhouse_server_connections = self.get_clickhouse_connection_group(
            clickhouse_connection_table=clickhouse_connection_table,
            properties_table=properties_table,
        )
        mysql_server_connections = self.get_mysql_connection_group(
            mysql_connections=mysql_connections, properties_table=properties_table
        )

        connections_list = []

        if clickhouse_server_connections:
            connections_list.append(clickhouse_server_connections)
        if mysql_server_connections:
            connections_list.append(mysql_server_connections)

        return connections_list
