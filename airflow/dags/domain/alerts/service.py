import logging
import pymysql
import pymssql
import psycopg2
from typing import List, Union

import requests

from apperture.backend_action import get

from domain.alerts.models import (
    Alert,
    CdcIntegration,
    IntegrationProvider,
    CdcCredential,
)
from domain.datasource.models import (
    ClickHouseCredential,
    ClickHouseRemoteConnectionCred,
)
from store.clickhouse_client_factory import ClickHouseClientFactory


class AlertsService:
    def __init__(self):
        self.db_client_map = {
            "mysql": pymysql,
            "mssql": pymssql,
            "psql": psycopg2,
        }

    def dispatch_alert(self, slack_url: str, payload):
        try:
            requests.post(
                slack_url,
                json={
                    "blocks": payload,
                },
            )
        except Exception as e:
            logging.info(f"Failed to send alert to Slack {slack_url}")

    def get_alerts(self) -> List[Alert]:
        logging.info("{x}: {y}".format(x="get_alerts", y="starts"))

        res = get(path=f"/private/alerts")
        alerts_response = res.json()
        alerts = [Alert(**alert) for alert in alerts_response]
        logging.info("{x}: {y}".format(x="get_alerts", y="ends"))
        return alerts

    def get_cdc_cred(self, datasource_id: str) -> CdcIntegration:
        res = get(path=f"/private/cdc?datasource_id={datasource_id}").json()
        return CdcIntegration(**res[0])

    def get_connection(self, cdc_cred: CdcCredential):
        client = self.db_client_map[cdc_cred.server_type]
        kwargs = {"user": cdc_cred.username, "password": cdc_cred.password}
        if cdc_cred.server_type == IntegrationProvider.MYSQL:
            kwargs.update(
                {
                    "host": cdc_cred.server,
                    "port": int(cdc_cred.port),
                    "database": cdc_cred.database,
                }
            )
        elif cdc_cred.server_type == IntegrationProvider.MSSQL:
            kwargs.update(
                {
                    "server": cdc_cred.server,
                    "port": cdc_cred.port,
                    "database": cdc_cred.database,
                }
            )
        elif cdc_cred.server_type == IntegrationProvider.POSTGRESQL:
            kwargs.update(
                {
                    "host": cdc_cred.server,
                    "port": int(cdc_cred.port),
                    "dbname": cdc_cred.database,
                }
            )
        connection = client.connect(**kwargs)
        return connection

    def execute_query(self, connection, query):
        cursor = connection.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        return result

    def get_row_counts_for_source_table(self, cdc_cred: CdcCredential, table: str):
        query = f"select count(*) from {table};"
        connection = self.get_connection(cdc_cred=cdc_cred)
        result = self.execute_query(connection=connection, query=query)
        return result

    def get_row_counts_for_source_db(self, cdc_cred: CdcCredential):
        query_map = {
            "mysql": f"SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = {cdc_cred.database};",
            "mssql": f"SELECT table_name = t.name, row_count = p.rows FROM sys.tables t INNER JOIN sys.partitions p ON t.object_id = p.object_id WHERE t.is_ms_shipped = 0;",
            "psql": f"SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;",
        }

        query = query_map[cdc_cred.server_type]
        connection = self.get_connection(cdc_cred=cdc_cred)
        result = self.execute_query(connection=connection, query=query)
        logging.info(f"Query Result:{result}")
        return result

    def get_row_frequency_for_source_table(
        self,
        cdc_cred: CdcCredential,
        table: str,
        last_n_minutes: int,
        timestamp_column: str,
    ):
        query_map = {
            "mysql": f"SELECT COUNT(*) AS record_count FROM {table} WHERE {timestamp_column} >= NOW() - INTERVAL {last_n_minutes} MINUTE;",
            "mssql": f"SELECT COUNT(*) AS record_count FROM {table} WHERE {timestamp_column} >= DATEADD(MINUTE, -{last_n_minutes}, GETDATE());",
            "psql": f"SELECT COUNT(*) AS record_count FROM {table} WHERE {timestamp_column} >= current_timestamp - interval '{last_n_minutes} minutes';",
        }

        query = query_map[cdc_cred.server_type]
        connection = self.get_connection(cdc_cred=cdc_cred)
        result = self.execute_query(connection=connection, query=query)
        logging.info(f"Query Result:{result}")
        return result

    def get_row_frequency_for_ch_table(
        self,
        app_id: str,
        ch_cred: ClickHouseCredential,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
        table: str,
        last_n_minutes: int,
        timestamp_column: str,
    ):
        query = f"SELECT count(*) AS record_count FROM {ch_cred.databasename}.{table} WHERE toDateTime({timestamp_column}/1000) >= now() - INTERVAL {last_n_minutes} minute"
        return self.execute_ch_query(
            app_id=app_id,
            clickhouse_server_credential=clickhouse_server_credential,
            query=query,
        )

    def get_column_counts_for_source_db(self, cdc_cred: CdcCredential):
        query_map = {
            "mysql": f"SELECT table_name, COUNT(column_name) AS num_columns FROM information_schema.columns WHERE table_schema = {cdc_cred.database} GROUP BY table_name;",
            "mssql": f"SELECT t.name AS table_name, COUNT(c.name) AS num_columns FROM sys.tables t INNER JOIN sys.columns c ON t.object_id = c.object_id GROUP BY t.name;",
            "psql": f"SELECT table_name, COUNT(column_name) AS num_columns FROM information_schema.columns WHERE table_schema = {cdc_cred.database} GROUP BY table_name;",
        }

        query = query_map[cdc_cred.server_type]
        connection = self.get_connection(cdc_cred=cdc_cred)
        result = self.execute_query(connection=connection, query=query)
        logging.info(f"Query Result:{result}")
        return result

    def execute_ch_query(
        self,
        app_id: str,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
        query: str,
    ):
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credential
        )
        result = clickhouse_client.query(query=query).result_set
        return result

    def get_row_counts_for_ch_db(
        self,
        app_id: str,
        ch_cred: ClickHouseCredential,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
    ):
        query = f"select name, total_rows from system.tables where database='{ch_cred.databasename}'"
        return self.execute_ch_query(
            app_id=app_id,
            clickhouse_server_credential=clickhouse_server_credential,
            query=query,
        )

    def get_column_counts_for_ch_db(
        self,
        app_id: str,
        ch_cred: ClickHouseCredential,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
    ):
        query = f"select table, count() as num_columns from system.columns where database='{ch_cred.databasename}' group by table"
        return self.execute_ch_query(
            app_id=app_id,
            clickhouse_server_credential=clickhouse_server_credential,
            query=query,
        )

    def get_row_counts_for_ch_table(
        self,
        app_id: str,
        shard: str,
        ch_cred: ClickHouseCredential,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
        table: str,
    ):
        query = (
            f"select count(*) from {ch_cred.databasename}.{table} where shard='{shard}'"
        )
        return self.execute_ch_query(
            app_id=app_id,
            clickhouse_server_credential=clickhouse_server_credential,
            query=query,
        )
