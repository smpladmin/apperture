import logging
from typing import List, Union

from models.models import ClickHouseRemoteConnectionCred
from clickhouse_client_factory import ClickHouseClientFactory
from clickhouse_connect.driver.exceptions import DatabaseError


class ClickHouse:
    def save_events(
        self,
        events,
        columns: List[str],
        table: str,
        database: str,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
        app_id: str,
    ) -> None:
        """Saves events to ClickHouse."""
        try:
            self._save(
                events=events,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=clickhouse_server_credential,
                app_id=app_id,
            )
        except DatabaseError as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to save sequentially")
            for event in events:
                self._save(
                    events=[event],
                    columns=columns,
                    table=table,
                    database=database,
                    app_id=app_id,
                    clickhouse_server_credential=clickhouse_server_credential,
                )
            logging.info("Saved sequentially")

    def _save(
        self,
        events,
        columns: List[str],
        table: str,
        database: str,
        clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
        app_id: str,
    ) -> None:
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credential
        )
        clickhouse_client.connection.insert(
            table=table,
            data=events,
            database=database,
            column_names=columns,
            settings={"insert_async": True, "wait_for_async_insert": False},
        )
        clickhouse_client.close()
