import logging
import pymssql
from typing import List

from repositories.sql.base import SQLBase
from domain.spreadsheets.models import SQLQueryResult
from domain.integrations.models import MsSQLCredential


class MsSql(SQLBase):
    def get_table_columns(self, connection, table_name: str) -> List[str]:
        return self.execute_query(
            connection=connection, query=f"EXEC sp_columns {table_name}", index=3
        )

    def get_tables(self, connection, database: str) -> List[str]:
        return self.execute_query(
            connection=connection, query=f"USE {database}; SELECT name from sys.tables"
        )

    def get_dbs(self, connection) -> List[str]:
        return self.execute_query(
            connection=connection, query="SELECT name from sys.databases"
        )

    def get_connection(self, host, username, password, database=None, port=None):
        return pymssql.connect(
            server=host,
            user=username,
            password=password,
        )

    def connect_and_execute_query(self, query: str, credential: MsSQLCredential):
        result = SQLQueryResult(result_set=[], column_names=[], column_types=[])
        try:
            if credential.ssh_credential:
                tunnel = self.create_ssh_tunnel(
                    ssh_credential=credential.ssh_credential,
                    host=credential.server,
                    port=credential.port,
                )
                with tunnel:
                    connection = self.get_connection(
                        host=tunnel.local_bind_host,
                        port=tunnel.local_bind_port,
                        username=credential.username,
                        password=credential.password,
                    )
                    self.set_query_result(
                        connection=connection, query=query, result=result
                    )
                    connection.close()

            else:
                connection = self.get_connection(
                    host=credential.server,
                    username=credential.username,
                    password=credential.password,
                )
                self.set_query_result(connection=connection, query=query, result=result)
                connection.close()

        except Exception as e:
            logging.info(f"Connection refused {e}")
        return result
