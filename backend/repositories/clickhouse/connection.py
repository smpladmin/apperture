import logging
from typing import List

from beanie import PydanticObjectId
from fastapi import Depends
from pypika import ClickHouseQuery, Table

from domain.connections.models import ConnectionSource
from domain.integrations.models import MySQLCredential
from repositories.clickhouse.base import EventsBase
from repositories.clickhouse.my_sql import MySql


class Connection:
    def __init__(
        self, mysql_client: MySql = Depends(), clickhouse_client: EventsBase = Depends()
    ):
        self.mysql_client = mysql_client
        self.clickhouse_client = clickhouse_client

    def get_sql_connection_sources_by_dsid(
        self,
        dsId: PydanticObjectId,
        credentials: MySQLCredential,
    ) -> List[ConnectionSource]:
        connection_sources = {}
        try:
            client_connection = self.create_connection(credentials=credentials)
            if client_connection:
                with client_connection:
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
                                    datasource_id=dsId,
                                    table_name=table,
                                )
                            )
        except Exception as e:
            logging.info(f"Connection refused {e}")
        return connection_sources

    def create_connection(
        self,
        credentials: MySQLCredential,
    ):
        if credentials.ssh_credential:
            tunnel = self.create_ssh_tunnel(
                credentials.ssh_credential, credentials.host, credentials.port
            )
            if tunnel:
                with tunnel:
                    return self.mysql_client.get_mysql_connection(
                        host=tunnel.local_bind_host,
                        port=tunnel.local_bind_port,
                        username=credentials.username,
                        password=credentials.password,
                    )
        else:
            try:
                return self.mysql_client.get_mysql_connection(
                    host=credentials.host,
                    port=credentials.port,
                    username=credentials.username,
                    password=credentials.password,
                )

            except Exception as e:
                logging.info(f"Connection refused {e}")

    def get_clickhouse_table_description(self, username, password, database, table):
        try:
            columns = []
            result = self.clickhouse_client.execute_query_for_restricted_client(
                f"DESCRIBE {database}.{table}", username=username, password=password
            ).result_set
            for row in result:
                columns.append(row[0])
            return columns
        except Exception as e:
            logging.info(f"Error: {e}")
        return []
