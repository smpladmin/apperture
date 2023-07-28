from typing import List

from fastapi.params import Depends

from domain.common.models import IntegrationProvider
from domain.connections.models import ConnectionGroup, Connections, ConnectionSource
from domain.datamart.models import DataMart
from domain.datasources.models import DataSource
from repositories.clickhouse.connection import Connection


class ConnectionService:
    def __init__(self, connection: Connection = Depends()):
        self.connection = connection

    def get_clickhouse_table_columns(self, username, password, database, table):
        return self.connection.get_clickhouse_table_description(
            username=username, password=password, database=database, table=table
        )

    def get_clickhouse_connection_group(
        self, clickhouse_connection_table, properties_table
    ):
        connection_data = []
        for provider, datasources in clickhouse_connection_table.items():
            group = ConnectionGroup(provider=provider, connection_source=[])
            for datasource in datasources:
                details = properties_table[str(datasource.id)]
                fields = [
                    "properties." + property
                    if datasource.provider != IntegrationProvider.CSV
                    else property
                    for property in (details["fields"] or [])
                ]
                group.connection_source.append(
                    ConnectionSource(
                        name=details.get(
                            "name",
                            datasource.name
                            or datasource.external_source_id
                            or datasource.provider,
                        ),
                        fields=["event_name", "user_id", *fields]
                        if datasource.provider != IntegrationProvider.CSV
                        else fields,
                        datasource_id=datasource.id,
                        table_name=details.get("name", "events"),
                        database_name=details.get("database", "default"),
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

    def get_mysql_connection_group(self, mysql_connections, credentials_table: dict):
        data = []
        for index, datasource in enumerate(mysql_connections):
            creds = credentials_table[str(datasource.id)]
            connection_table = self.connection.get_sql_connection_sources_by_dsid(
                datasource.id,
                creds,
            )
            for database, connections in connection_table.items():
                if database and connections:
                    data.append(
                        Connections(
                            server=f"MySQL {index+1}",
                            connection_data=[
                                ConnectionGroup(
                                    provider=database,
                                    connection_source=connections,
                                )
                            ],
                        )
                    )
        return data

    def get_datamart_connection(
        self, datamarts: List[DataMart], datamart_properties: dict
    ):
        connection_source = []
        for datamart in datamarts:
            details = datamart_properties[str(datamart.id)]
            connection_source.append(
                ConnectionSource(
                    name=details.get(
                        "name",
                        "Datamart",
                    ),
                    fields=details.get("fields", []),
                    datasource_id=datamart.datasource_id,
                    table_name=details.get("table", ""),
                    database_name=details.get("database", ""),
                )
            )

        return ConnectionGroup(provider="datamart", connection_source=connection_source)

    def get_sample_table_connections(
        self,
        tables: List[str],
        table_properties: dict,
        database: str,
    ):
        sources = [
            ConnectionSource(
                name=f"Sample table {table}",
                fields=table_properties[table],
                datasource_id=None,
                table_name=table,
                database_name=database,
            )
            for table in tables
        ]
        return ConnectionGroup(provider="sample", connection_source=sources)

    def get_connections_from_datasources(
        self,
        datasources: List[DataSource],
        properties_table: dict,
        credentials_table: dict,
        datamarts: List[DataMart],
        datamart_properties: dict,
        sample_tables: List[str],
        sample_table_properties: dict,
        app_database: str,
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
        datamart_connections = self.get_datamart_connection(
            datamarts=datamarts, datamart_properties=datamart_properties
        )
        sample_connections = self.get_sample_table_connections(
            sample_tables,
            sample_table_properties,
            app_database,
        )
        if sample_connections.connection_source:
            clickhouse_server_connections.connection_data.append(sample_connections)
        if datamart_connections.connection_source:
            clickhouse_server_connections.connection_data.append(datamart_connections)
        mysql_server_connections = self.get_mysql_connection_group(
            mysql_connections=mysql_connections, credentials_table=credentials_table
        )

        connections_list = []

        if clickhouse_server_connections:
            connections_list.append(clickhouse_server_connections)
        if mysql_server_connections:
            connections_list.extend(mysql_server_connections)

        return connections_list
