import logging

from beanie import PydanticObjectId
from fastapi import Depends

from clickhouse import Clickhouse
from domain.connections.models import ConnectionSource
from domain.integrations.models import MySQLCredential
from repositories.clickhouse.base import EventsBase
from repositories.mysql.mysql import MySql


class Connection(EventsBase):
    def __init__(
        self, mysql_client: MySql = Depends(), clickhouse: Clickhouse = Depends()
    ):
        super().__init__(clickhouse=clickhouse)
        self.mysql_client = mysql_client

    def get_db_details_from_connection(
        self, client_connection, datasource_id: PydanticObjectId, connection_sources
    ):
        databases = self.mysql_client.get_dbs(connection=client_connection)
        for database in databases:
            tables = self.mysql_client.get_tables(
                connection=client_connection, database=database
            )
            for table in tables:
                columns = self.mysql_client.get_table_columns(
                    connection=client_connection, table_name=table
                )
                if database not in connection_sources:
                    connection_sources[database] = []
                connection_sources[database].append(
                    ConnectionSource(
                        name=table,
                        fields=columns,
                        database_name=database,
                        datasource_id=datasource_id,
                        table_name=table,
                    )
                )

    def get_sql_connection_sources_by_dsid(
        self,
        datasource_id: PydanticObjectId,
        credentials: MySQLCredential,
    ):
        connection_sources = {}
        try:
            if credentials.ssh_credential:
                tunnel = self.mysql_client.create_ssh_tunnel(
                    ssh_credential=credentials.ssh_credential,
                    host=credentials.host,
                    port=credentials.port,
                )
                with tunnel:
                    client_connection = self.mysql_client.get_mysql_connection(
                        host=tunnel.local_bind_host,
                        port=tunnel.local_bind_port,
                        username=credentials.username,
                        password=credentials.password,
                    )
                    self.get_db_details_from_connection(
                        client_connection=client_connection,
                        datasource_id=datasource_id,
                        connection_sources=connection_sources,
                    )
                    client_connection.close()

            else:
                client_connection = self.mysql_client.get_mysql_connection(
                    host=credentials.host,
                    port=credentials.port,
                    username=credentials.username,
                    password=credentials.password,
                )
                self.get_db_details_from_connection(
                    client_connection=client_connection,
                    datasource_id=datasource_id,
                    connection_sources=connection_sources,
                )
                client_connection.close()

        except Exception as e:
            logging.info(f"Connection refused {e}")
        return connection_sources

    def get_clickhouse_table_description(self, username, password, database, table):
        try:
            columns = []
            result = self.execute_query_for_restricted_client(
                f"DESCRIBE {database}.{table}", username=username, password=password
            ).result_set
            for row in result:
                columns.append(row[0])
            return columns
        except Exception as e:
            logging.info(f"Error: {e}")
        return []
