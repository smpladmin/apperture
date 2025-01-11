import logging
import os
from typing import Union

import clickhouse_connect

from models.models import ClickHouseCredentials
from dotenv import load_dotenv

load_dotenv()

CLICKHOUSE_MAX_EXECUTION_TIME = int(os.getenv("CLICKHOUSE_MAX_EXECUTION_TIME", 900))
logging.info(f"CLICKHOUSE_MAX_EXECUTION_TIME: {CLICKHOUSE_MAX_EXECUTION_TIME}")


class ClickHouseClient:
    def __init__(
        self,
        app_id: str,
        connection_detail: Union[ClickHouseCredentials, None],
    ):
        self.app_id = app_id
        self.connection_detail = connection_detail
        self.connection = clickhouse_connect.get_client(
            host=connection_detail.host if connection_detail else "clickhouse",
            port=connection_detail.port if connection_detail else 0,
            username=connection_detail.username if connection_detail else None,
            password=connection_detail.password if connection_detail else "",
            allow_experimental_object_type=1,
            query_limit=0,
            max_execution_time=CLICKHOUSE_MAX_EXECUTION_TIME,
            connect_timeout=CLICKHOUSE_MAX_EXECUTION_TIME,
            send_receive_timeout=CLICKHOUSE_MAX_EXECUTION_TIME,
        )

    def query(self, query, parameters={}, settings={}):
        return self.connection.query(
            query=query, parameters=parameters, settings=settings
        )

    def close(self):
        self.connection.close()


class ClickHouseClientFactory:
    __clients = {}

    @staticmethod
    def get_client(
        app_id: str,
        clickhouse_server_credentials: Union[ClickHouseCredentials, None],
    ) -> ClickHouseClient:
        if app_id not in ClickHouseClientFactory.__clients:
            ClickHouseClientFactory.__clients[app_id] = ClickHouseClient(
                app_id=app_id, connection_detail=clickhouse_server_credentials
            )
        logging.info(
            f"Using {'REMOTE' if clickhouse_server_credentials else 'LOCAL'} client"
        )
        return ClickHouseClientFactory.__clients[app_id]

    @staticmethod
    def close_all_client_connection():
        for app_id, client in (ClickHouseClientFactory.__clients).items():
            logging.info(f"Closing client connection for: % {app_id}")
            client.close()
        logging.info("All connections closed")
