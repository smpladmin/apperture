import logging
from typing import List, Union
from .clickhouse_client_factory import ClickHouseClientFactory
from domain.alerts.service import AlertService
from models.models import ClickHouseCredentials

from clickhouse_connect.driver.exceptions import DatabaseError


class ClickHouse:
    def __init__(self):
        self.alert_service = AlertService()

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
            error_message = f"Error while saving events to {database}.{table}: {e}"
            logging.info(f"{error_message}")

            self.alert_service.post_message_to_slack(
                message=error_message, alert_type="Saving Events"
            )

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
            error_message = f"Error while saving events by splitting and saving to {database}.{table}: {e}"
            logging.info(f"{error_message}")
            logging.info("Trying to split and save")
            self.alert_service.post_message_to_slack(
                message=error_message, alert_type="Saving Events"
            )
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
        try:
            clickhouse_client.connection.insert(
                table=table,
                data=events,
                database=database,
                column_names=columns,
                settings={"insert_async": True, "wait_for_async_insert": False},
            )
        except Exception as e:
            error_message = f"Error while saving events to {database}.{table}: {e}"
            logging.info(f"{error_message}")
            self.alert_service.post_message_to_slack(
                message=error_message, alert_type="Saving Events"
            )

            clickhouse_client.close()
            raise Exception(f"Failed to save events: {e}")

    def get_table_columns_with_type(
        self,
        table: str,
        database: str,
        clickhouse_server_credential: Union[ClickHouseCredentials, None],
        app_id: str,
    ):
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credential
        )
        query = f"Select name, type from system.columns where database = '{database}' AND table = '{table}' "
        result = clickhouse_client.query(query=query).result_set

        logging.info(f"Columns for table {database}.{table}: {result}")
        clickhouse_client.close()
        return result

    def get_table_primary_key(
        self,
        table: str,
        database: str,
        clickhouse_server_credential: Union[ClickHouseCredentials, None],
        app_id: str,
    ):
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credential
        )
        query = f"Select primary_key from system.tables where database='{database}' AND table='{table}' "
        result = clickhouse_client.query(query=query).result_set
        logging.info(f"Primary key for table {database}.{table}: {result}")
        clickhouse_client.close()
        if not result:
            error_message = f"Primary key for table {database}.{table} does not exist."
            self.alert_service.post_message_to_slack(
                message=error_message, alert_type="Primary Key Error"
            )
        return result[0][0] if result else ""

    def get_row_values(
        self,
        table: str,
        database: str,
        id_values: list,
        id: str,
        clickhouse_server_credential: Union[ClickHouseCredentials, None],
        app_id: str,
    ):
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credential
        )
        quoted_values = [f"'{value}'" for value in id_values]
        values = ",".join(quoted_values)
        query = f"SELECT * FROM {database}.{table} FINAL WHERE {id} IN ({values})"
        result = clickhouse_client.query(query=query)

        data = result.result_set
        columns = result.column_names
        result_list = [dict(zip(columns, values)) for values in data]
        logging.info(f"Records for {database}.{table}: {result_list} ")
        clickhouse_client.close()
        return result_list
