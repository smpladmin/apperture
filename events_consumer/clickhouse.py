import logging
import clickhouse_connect

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
        self.client.insert(
            "clickstream",
            events,
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
