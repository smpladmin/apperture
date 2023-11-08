import logging
from typing import List, Union

import clickhouse_connect
from clickhouse_connect.driver.exceptions import DatabaseError
from clickhouse_client_factory import ClickHouseClientFactory

from models.models import ClickHouseRemoteConnectionCred

# ClickHouse configuration.
CLICKHOUSE_HOST = "clickhouse"
CLICKHOUSE_PORT = 8123
CLICKHOUSE_DATABASE = "default"
CLICKHOUSE_TABLE = "clickstream"


class ClickHouse:
    def connect(self):
        self.client = clickhouse_connect.get_client(
            host="clickhouse",
            query_limit=0,
        )
        logging.info("Connected to ClickHouse")

    def disconnect(self):
        self.client.close()

    def save_events(
        self, events, columns: List[str], table: str, database: str, clickhouse_server_credential:Union[ClickHouseRemoteConnectionCred, None], appId:str
    ) -> None:
        """Saves events to ClickHouse."""
        try:
            self._save(events=events, columns=columns, table=table, database=database, clickhouse_server_credential=clickhouse_server_credential, appId=appId)
        except DatabaseError as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to save sequentially")
            for event in events:
                self._save(
                    events=[event], columns=columns, table=table, database=database
                )
            logging.info("Saved sequentially")

    def _save(self, events, columns: List[str], table: str, database: str, clickhouse_server_credential:Union[ClickHouseRemoteConnectionCred, None], appId:str) -> None:
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credential
        )
        self.client.insert(
            table=table,
            data=events,
            database=database,
            column_names=columns,
            settings={"insert_async": True, "wait_for_async_insert": False},
        )
