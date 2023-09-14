import logging
import tempfile
from abc import ABC, abstractmethod
from typing import List

import sshtunnel

from domain.integrations.models import DatabaseSSHCredential
from domain.spreadsheets.models import SQLQueryResult


class SQLBase(ABC):
    @abstractmethod
    def get_table_columns(self, connection, table_name: str) -> List[str]:
        pass

    @abstractmethod
    def get_tables(self, connection, database: str) -> List[str]:
        pass

    @abstractmethod
    def get_dbs(self, connection) -> List[str]:
        pass

    @abstractmethod
    def get_connection(self, host, port, username, password, database=None):
        pass

    @abstractmethod
    def connect_and_execute_query(self, query: str, credential):
        pass

    def execute_query(self, connection, query: str, index: int = 0) -> List[str]:
        cursor = connection.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
        return [result[index] for result in results]

    def set_query_result(self, connection, query: str, result: SQLQueryResult):
        cursor = connection.cursor()
        cursor.execute(query)
        result.column_names = [i[0] for i in cursor.description]
        result.column_types = [i[1] for i in cursor.description]
        result.result_set = list(cursor.fetchall())

    def create_temp_file(self, content: str):
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        temp_file.write(content.encode("utf-8"))
        temp_file.flush()
        return temp_file.name

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
