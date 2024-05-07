import logging
import os
import clickhouse_connect
from clickhouse_connect.driver.exceptions import DatabaseError

# ClickHouse configuration.
CLICKHOUSE_HOST = "clickhouse"
CLICKHOUSE_PORT = 8123
CLICKHOUSE_DATABASE = "default"
CLICKHOUSE_TABLE = "clickstream"
GUPSHUP_CLICKHOUSE_HOST = os.getenv("GUPSHUP_CLICKHOUSE_HOST")
GUPSHUP_CLICKHOUSE_TABLE = os.getenv("GUPSHUP_CLICKHOUSE_TABLE")
GUPSHUP_CLICKHOUSE_USER = os.getenv("GUPSHUP_CLICKHOUSE_USER")
GUPSHUP_CLICKHOUSE_PASSWORD = os.getenv("GUPSHUP_CLICKHOUSE_PASSWORD")


class ClickHouse:
    def connect(self):
        self.client = clickhouse_connect.get_client(
            host="clickhouse",
            query_limit=0,
        )
        self.gupshup_ch_client = clickhouse_connect.get_client(
            host=GUPSHUP_CLICKHOUSE_HOST,
            user=GUPSHUP_CLICKHOUSE_USER,
            password=GUPSHUP_CLICKHOUSE_PASSWORD,
            query_limit=0,
        )
        logging.debug("Connected to ClickHouse")

    def disconnect(self):
        self.client.close()

    def save_events(self, events) -> None:
        """Saves events to ClickHouse."""
        logging.info(f"No. of events to be saved: {len(events)}")
        try:
            self._save(events)
        except DatabaseError as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to save recursively")
            self.rsave_events(events=events)
            logging.info("Saving recursively ends")

    def rsave_events(self, events):
        """Saves events to clickHouse with recursive retries using split backoff."""
        if not events:
            return

        if len(events) == 1:
            self._save(events)
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
        logging.info(f"Saving {len(events)} events")
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
        logging.info(f"Saved {len(events)} events")

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

    def save_gupshup_events(self, gupshup_events):
        """Saves gupshup events to Wiom's ClickHouse."""
        logging.info(f"Saved {len(gupshup_events)} gupshup events.")
        self.gupshup_ch_client.insert(
            table=GUPSHUP_CLICKHOUSE_TABLE,
            data=gupshup_events,
            column_names=[
                "external_id",
                "event_type",
                "timestamp",
                "dest_addr",
                "src_addr",
                "cause",
                "err_code",
                "channel",
                "hsm_template_id",
            ],
            settings={"insert_async": True, "wait_for_async_insert": False},
        )
        logging.info(f"Saved {len(gupshup_events)} gupshup events.")
