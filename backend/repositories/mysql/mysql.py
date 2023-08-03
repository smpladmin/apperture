import logging
import tempfile
from abc import ABC
from typing import List

import pymysql
import sshtunnel

from domain.integrations.models import DatabaseSSHCredential, MySQLCredential
from domain.spreadsheets.models import MySQLQueryResult


class MySql(ABC):
    def get_table_columns(self, connection, table_name) -> List[str]:
        fields = []
        cursor = connection.cursor()
        cursor.execute(f"DESCRIBE {table_name}")
        results = cursor.fetchall()
        for result in results:
            fields.append(result[0])
        return fields

    def get_tables(self, connection, database) -> List[str]:
        fields = []
        cursor = connection.cursor()
        cursor.execute(f"USE {database}")
        cursor.execute(f"SHOW TABLES")
        results = cursor.fetchall()
        for result in results:
            fields.append(result[0])
        return fields

    def get_dbs(self, connection) -> List[str]:
        fields = []
        cursor = connection.cursor()
        cursor.execute(f"SHOW DATABASES")
        results = cursor.fetchall()
        for result in results:
            if result[0] not in [
                "information_schema",
                "my_sql",
                "performance_schema",
            ]:
                fields.append(result[0])
        return fields

    def create_temp_file(self, content: str):
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(content.encode("utf-8"))
        temp_file.flush()
        return temp_file.name

    def get_mysql_connection(self, host, port, username, password, database=None):
        return (
            pymysql.connect(
                host=host,
                port=int(port),
                user=username,
                password=password,
                database=database,
                ssl_verify_identity=True,
            )
            if database
            else pymysql.connect(
                host=host,
                port=int(port),
                user=username,
                password=password,
                ssl_verify_identity=True,
            )
        )

    def create_ssh_tunnel(
        self, ssh_credential: DatabaseSSHCredential, host: str, port: str
    ):
        logging.info("SSH credentials exist")
        ssh_pkey = None
        if ssh_credential.ssh_key:
            logging.info("SSH key exists, creating temp file to store ssh key")
            ssh_pkey = self.create_temp_file(ssh_credential.ssh_key)
            logging.info(f"Temporary file name: {ssh_pkey}")

        try:
            tunnel = sshtunnel.SSHTunnelForwarder(
                (ssh_credential.server, int(ssh_credential.port)),
                ssh_pkey=ssh_pkey,
                ssh_username=ssh_credential.username,
                ssh_password=ssh_credential.password,
                remote_bind_address=(host, int(port)),
            )
            tunnel.start()
            logging.info(
                f"Created SSH tunnel, binding ({host, port}) to ({tunnel.local_bind_host, tunnel.local_bind_port})"
            )
            return tunnel
        except Exception as e:
            logging.info(f"Connection failed with exception: {e}")
            return None

    def set_query_result(self, connection, query: str, result: MySQLQueryResult):
        cursor = connection.cursor()
        cursor.execute(query)
        result.column_names = [i[0] for i in cursor.description]
        result.result_set = list(cursor.fetchall())

    def execute_mysql_query(self, query: str, credential: MySQLCredential):
        result = MySQLQueryResult(result_set=[], column_names=[])
        try:
            if credential.ssh_credential:
                tunnel = self.create_ssh_tunnel(
                    ssh_credential=credential.ssh_credential,
                    host=credential.host,
                    port=credential.port,
                )
                with tunnel:
                    connection = self.get_mysql_connection(
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
                connection = self.get_mysql_connection(
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
