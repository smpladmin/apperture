import logging
import clickhouse_connect
from clickhouse_connect.driver.exceptions import DatabaseError

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

    def save_events(self, events) -> None:
        """Saves events to ClickHouse."""
        try:
            self._save(events)
        except DatabaseError as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to save sequentially")
            for event in events:
                self._save([event])
            logging.info("Saved sequentially")

    def rsave_events(self, events):
        """Saves events to clickHouse with recursive retries using split backoff."""
        if not events:
            return

        if len(events) == 1:
            try:
                self._save(events)
            except Exception as e:
                # Skip saving this event.
                logging.info(
                    f"Error encountered for event {events[0]}: {e}. Cannot split further."
                )
            return

        try:
            self._save(events)
        except Exception as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to split and save")

            mid = len(events) // 2
            first_half = events[:mid]
            second_half = events[mid:]

            self.rsave_events(first_half)
            self.rsave_events(second_half)

    def _save(self, events) -> None:
        logging.info(f"saving: {events}")
        self.client.insert(
            table="clickstream",
            data=events,
            column_names=[
                "datasource_id",
                "timestamp",
                "user_id",
                "element_chain",
                "event",
                "properties",
            ],
            settings={"insert_async": True, "wait_for_async_insert": False},
        )

    def _save_precision_events(self, events) -> None:
        self.client.insert(
            table="events",
            data=events,
            column_names=[
                "datasource_id",
                "timestamp",
                "provider",
                "user_id",
                "event_name",
                "properties",
            ],
            settings={"insert_async": True, "wait_for_async_insert": False},
        )

    def save_precision_events(self, events):
        """Saves precision events to ClickHouse."""
        try:
            self._save_precision_events(events)
        except DatabaseError as e:
            logging.info(f"Exception saving events to Eventstream: {e}")
            logging.info("Trying to save sequentially")
            for event in events:
                self._save_precision_events([event])
            logging.info("Saved sequentially")
