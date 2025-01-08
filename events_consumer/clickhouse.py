import logging
import os
import clickhouse_connect
from clickhouse_connect.driver.exceptions import DatabaseError
from datetime import datetime
import json

from clickhouse_client_factory import ClickHouseClientFactory

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

    def save_events(self, events, app_id, clickhouse_server_credentials) -> None:
        """Saves events to ClickHouse."""
        logging.info(f"No. of events to be saved: {len(events)}")
        try:
            self._save(events, app_id, clickhouse_server_credentials)
        except DatabaseError as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to save recursively")
            self.rsave_events(
                events=events,
                app_id=app_id,
                clickhouse_server_credentials=clickhouse_server_credentials,
            )
            logging.info("Saving recursively ends")

    def rsave_events(self, events, app_id, clickhouse_server_credentials):
        """Saves events to clickHouse with recursive retries using split backoff."""
        if not events:
            return

        if len(events) == 1:
            self._save(events, app_id, clickhouse_server_credentials)
            return

        try:
            self._save(events, app_id, clickhouse_server_credentials)
        except Exception as e:
            logging.info(f"Exception saving events to ClickHouse: {e}")
            logging.info("Trying to split and save")

            mid = len(events) // 2
            first_half = events[:mid]
            second_half = events[mid:]

            self.rsave_events(first_half, app_id, clickhouse_server_credentials)
            self.rsave_events(second_half, app_id, clickhouse_server_credentials)

    def _save(self, events, app_id, clickhouse_server_credentials) -> None:
        logging.info(f"Saving {len(events)} events")
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credentials
        )
        # clickhouse_client
        clickhouse_client.connection.insert(
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

    def _save_precision_events(
        self, events, app_id, clickhouse_server_credentials
    ) -> None:
        clickhouse_client = ClickHouseClientFactory.get_client(
            app_id=app_id, clickhouse_server_credentials=clickhouse_server_credentials
        )
        clickhouse_client.connection.insert(
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

    def save_precision_events(self, events, app_id, clickhouse_server_credentials):
        """Saves precision events to ClickHouse."""
        try:
            self._save_precision_events(
                events=events,
                app_id=app_id,
                clickhouse_server_credentials=clickhouse_server_credentials,
            )
        except DatabaseError as e:
            logging.info(f"Exception saving events to Eventstream: {e}")
            logging.info("Trying to save sequentially")
            for event in events:
                self._save_precision_events(
                    [event],
                    app_id=app_id,
                    clickhouse_server_credentials=clickhouse_server_credentials,
                )
            logging.info("Saved sequentially")

    def save_gupshup_events(self, gupshup_events):
        """Saves gupshup events to Wiom's ClickHouse."""
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
                "no_of_frags",
            ],
            settings={"insert_async": True, "wait_for_async_insert": False},
        )
        logging.info(f"Saved {len(gupshup_events)} gupshup events.")

    def save_agent_log_events(self, agent_log_events):
        """Saves the agent log events to ClickHouse."""
        data = []
        for event in agent_log_events:
            try:
                query_id = event["query_id"]
                user_query = event["user_query"]
                timestamp = event["timestamp"]
                cost = event["cost"]
                agent_calls = json.dumps(event["agent_calls"])
                datasource_id = event["datasource_id"]

                data.append(
                    (query_id, user_query, timestamp, cost, agent_calls, datasource_id)
                )
                logging.info(f"agent data: {data}")
            except (KeyError, ValueError, TypeError) as e:
                logging.warning(f"Skipping event due to invalid data: {e}")

        logging.info(f"saving this agent data: {data}")
        if data:
            self.client.insert(
                table="agent_log_events",
                data=data,
                column_names=[
                    "query_id",
                    "user_query",
                    "timestamp",
                    "cost",
                    "agent_calls",
                    "datasource_id",
                ],
                settings={"insert_async": True, "wait_for_async_insert": False},
            )
            logging.info(f"Saved {len(data)} agent log events.")
        else:
            logging.warning("No valid agent log events to save.")
