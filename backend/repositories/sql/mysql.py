import logging
import pymysql
from typing import List

from repositories.sql.base import SQLBase
from domain.spreadsheets.models import SQLQueryResult
from domain.integrations.models import MySQLCredential


class MySql(SQLBase):
    def get_table_columns(self, connection, table_name: str) -> List[str]:
        return self.execute_query(connection=connection, query=f"DESCRIBE {table_name}")

    def get_tables(self, connection, database: str) -> List[str]:
        cursor = connection.cursor()
        cursor.execute(f"USE {database}")
        cursor.execute(f"SHOW TABLES")
        results = cursor.fetchall()
        return [result[0] for result in results]

    def get_cdc_tables(self, connection, database: str) -> List[str]:
        return self.get_tables(connection=connection, database=database)

    def get_dbs(self, connection) -> List[str]:
        return self.execute_query(connection=connection, query="SHOW DATABASES")

    def get_connection(self, host, port, username, password, database=None):
        return pymysql.connect(
            host=host,
            port=int(port),
            user=username,
            password=password,
            database=database,
            ssl_verify_identity=True,
        )

    def connect_and_execute_query(self, query: str, credential: MySQLCredential):
        result = SQLQueryResult(result_set=[], column_names=[], column_types=[])
        try:
            if credential.ssh_credential:
                tunnel = self.create_ssh_tunnel(
                    ssh_credential=credential.ssh_credential,
                    host=credential.host,
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
                    host=credential.host,
                    port=credential.port,
                    username=credential.username,
                    password=credential.password,
                )
                self.set_query_result(connection=connection, query=query, result=result)
                connection.close()

        except Exception as e:
            logging.info(f"Connection refused {e}")
        return result

    def get_table_description(self, connection, table_name: str, database: str):
        """
        @param connection:
        @param table_name:
        @param database:
        @return: List of lists containing column_name, datatype and nullable.
        """
        cursor = connection.cursor()
        cursor.execute(f"USE {database};")
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        results = cursor.fetchall()
        return [[result[0], result[1], result[2] == "YES"] for result in results]
