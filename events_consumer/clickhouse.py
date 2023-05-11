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
            logging.error(f"Error saving events to ClickHouse: {e}")
            logging.info("Trying to save sequentially")
            for event in events:
                self._save([event])
            logging.info("Saved sequentially")

    def _save(self, events) -> None:
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

    def save_precision_events(self, events) -> None:
        """Saves events to ClickHouse."""
        self.client.insert(
            "events",
            events,
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
