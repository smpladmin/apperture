import logging
from abc import ABC
from typing import List

import pymysql
import sshtunnel

from rest.dtos.integrations import DatabaseSSHCredentialDto


class MySql(ABC):
    def __init__(self):
        self.client = pymysql

    def get_mysql_connection(self, host, port, username, password, database=None):
        return (
            self.client.connect(
                host=host,
                port=int(port),
                user=username,
                password=password,
                database=database,
            )
            if database
            else self.client.connect(
                host=host,
                port=int(port),
                user=username,
                password=password,
            )
        )

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

    def create_ssh_tunnel(
        self, ssh_credential: DatabaseSSHCredentialDto, host: str, port: str
    ):
        logging.info("SSH credentials exist")
        ssh_pkey = None
        if ssh_credential.sshKey:
            logging.info("SSH key exists, creating temp file to store ssh key")
            ssh_pkey = self.create_temp_file(ssh_credential.sshKey)
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
