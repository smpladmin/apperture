import logging
import time
from functools import wraps
from typing import List, Union
from .clickhouse_client_factory import ClickHouseClientFactory
from domain.alerts.service import AlertService
from models.models import ClickHouseCredentials

from clickhouse_connect.driver.exceptions import DatabaseError


MAX_RETRIES = 3
INITIAL_WAIT_SECONDS = 1
MAX_WAIT_SECONDS = 10


def with_clickhouse_retry(func):
    """
    Decorator that implements retry logic for ClickHouse operations.
    Includes exponential backoff and handles session locked errors.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        retry_count = 0
        wait_time = INITIAL_WAIT_SECONDS

        while retry_count < MAX_RETRIES:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                retry_count += 1
                error_msg = str(e)

                if "SESSION_IS_LOCKED" in error_msg:
                    if retry_count == MAX_RETRIES:
                        logging.info(f"Failed after {MAX_RETRIES} retries: {error_msg}")
                        raise

                    # Calculate wait time with exponential backoff
                    wait_time = min(wait_time * 2, MAX_WAIT_SECONDS)

                    logging.info(
                        f"ClickHouse session locked, attempt {retry_count}/{MAX_RETRIES}. "
                        f"Retrying in {wait_time} seconds... Error: {error_msg}"
                    )

                    time.sleep(wait_time)
                    continue
                else:
                    logging.info(f"ClickHouse error: {error_msg}")
                    raise

        raise Exception(f"Failed after {MAX_RETRIES} retries")

    return wrapper


class ClickHouse:
    def __init__(self):
        self.alert_service = AlertService()

    @with_clickhouse_retry
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

    def escape_sql_string(self, value):
        """
        Escapes special characters in a string to safely include it in an SQL query.

        This method ensures that backslashes and single quotes within the string
        are properly escaped so they do not interfere with the SQL syntax. It is
        particularly useful when constructing SQL queries dynamically with values
        that may contain these special characters.

        Example:
            Input: "8389679878\\", "8389679878_ARCHIEVED", "8389679878"
            Output after escaping:
                "8389679878\\" becomes "8389679878\\\\"
                "8389679878_ARCHIEVED" remains "8389679878_ARCHIEVED"
                "8389679878" remains "8389679878"

        Args:
            value (str): The string value to be escaped.

        Returns:
            str: The escaped string suitable for use in an SQL query.
        """
        return value.replace("\\", "\\\\").replace("'", "\\'")

    @with_clickhouse_retry
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
        formatted_values = ",".join(
            f"'{self.escape_sql_string(value)}'" for value in id_values
        )
        query = (
            f"SELECT * FROM {database}.{table} FINAL WHERE {id} IN ({formatted_values})"
        )
        result = clickhouse_client.query(query=query)

        data = result.result_set
        columns = result.column_names
        result_list = [dict(zip(columns, values)) for values in data]
        logging.info(f"Records for {database}.{table}: {result_list} ")
        clickhouse_client.close()
        return result_list
