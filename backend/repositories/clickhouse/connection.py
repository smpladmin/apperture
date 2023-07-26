import logging
from typing import List

from beanie import PydanticObjectId
from fastapi import Depends

from domain.connections.models import ConnectionSource
from domain.integrations.models import MySQLCredential
from repositories.clickhouse.my_sql import MySql


class Connection:
    def __init__(self, mysql: MySql = Depends()):
        self.mysql = mysql

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
                    databases = self.mysql.get_dbs(connection=client_connection)
                    for database in databases:
                        tables = self.mysql.get_tables(
                            connection=client_connection, database=database
                        )
                        for table in tables:
                            columns = self.mysql.get_table_columns(
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
                    return self.mysql.get_mysql_connection(
                        host=tunnel.local_bind_host,
                        port=tunnel.local_bind_port,
                        username=credentials.username,
                        password=credentials.password,
                    )
        else:
            try:
                return self.mysql.get_mysql_connection(
                    host=credentials.host,
                    port=credentials.port,
                    username=credentials.username,
                    password=credentials.password,
                )

            except Exception as e:
                logging.info(f"Connection refused {e}")
