import logging
from typing import List, Union

from models.models import ClickHouseCredentials
from clickhouse_client_factory import ClickHouseClientFactory
from clickhouse_connect.driver.exceptions import DatabaseError


class ClickHouse:
    def save_events(
        self,
        events,
        columns: List[str],
        table: str,
        database: str,
        clickhouse_server_credential: Union[ClickHouseCredentials, None],
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
            raise

    def rsave_events(
        self,
        events,
        columns: List[str],
        table: str,
        database: str,
        clickhouse_server_credential: Union[ClickHouseCredentials, None],
        app_id: str,
    ):
        """Saves events to clickHouse with recursive retries using split backoff."""
        if not events:
            return

        if len(events) == 1:
            self._save(
                events=events,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=clickhouse_server_credential,
                app_id=app_id,
            )
            return

        try:
            self._save(
                events=events,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=clickhouse_server_credential,
                app_id=app_id,
            )
        except Exception as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to split and save")

            mid = len(events) // 2
            first_half = events[:mid]
            second_half = events[mid:]

            self.rsave_events(
                events=first_half,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=clickhouse_server_credential,
                app_id=app_id,
            )
            self.rsave_events(
                events=second_half,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=clickhouse_server_credential,
                app_id=app_id,
            )

    def _save(
        self,
        events,
        columns: List[str],
        table: str,
        database: str,
        clickhouse_server_credential: Union[ClickHouseCredentials, None],
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
