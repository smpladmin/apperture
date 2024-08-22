import asyncio
import base64
from datetime import datetime, timezone
from functools import reduce
import json
import logging
import os
import sys
import traceback
from typing import Dict, List

from aiokafka import AIOKafkaConsumer

from dotenv import load_dotenv

from datasource_details import DatasourceDetails

load_dotenv()

from clickhouse import ClickHouse

from event_properties_saver import EventPropertiesSaver
from models.models import ClickStream, PrecisionEvent


TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "60000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "1000"))
GUPSHUP_MAX_RECORDS = int(os.getenv("GUPSHUP_MAX_RECORDS", "1000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
MAX_POLL_INTERVAL_MS = int(os.getenv("MAX_POLL_INTERVAL_MS", 300000))
SESSION_TIMEOUT_MS = int(os.getenv("SESSION_TIMEOUT_MS", 10000))
HEARTBEAT_INTERVAL_MS = int(os.getenv("HEARTBEAT_INTERVAL_MS", 3000))
REQUEST_TIMEOUT_MS = int(os.getenv("REQUEST_TIMEOUT_MS", 40 * 1000))

logging.getLogger().setLevel(LOG_LEVEL)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.debug(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")

KAFKA_TOPICS = os.getenv("KAFKA_TOPICS", "clickstream").split(",")
DEFAULT_EVENTS = [
    "$autocapture",
    "$pageview",
    "$pageleave",
    "$identify",
    "$rageclick",
]


def save_events(events):
    """Saves events to ClickHouse."""
    logging.debug(f"Saving {len(events)} events")

    segregated_events = {}

    # Iterate over the events and group them by datasource_id
    for event in events:
        datasource_id = event["properties"]["token"]
        cs_event = ClickStream.build(
            datasource_id=datasource_id,
            timestamp=event["properties"]["$time"],
            user_id=event["properties"]["$device_id"],
            event=event["event"],
            properties=event["properties"],
        )
        if datasource_id not in segregated_events:
            segregated_events[datasource_id] = []
        segregated_events[datasource_id].append(cs_event)

    for datasource, cs_events in segregated_events.items():
        app_details = app.datasource_details.get_details(datasource_id=datasource)
        app.clickhouse.save_events(
            events=cs_events,
            app_id=app_details.app_id,
            clickhouse_server_credentials=app_details.ch_server_credential,
        )

    logging.info("Saved events")


def save_flutter_events(events):
    logging.debug(f"Saving {len(events)} flutter events")
    segregated_events = {}
    for event in events:
        datasource_id = event["datasource_id"]
        flutter_event = PrecisionEvent.build(
            datasourceId=event["datasource_id"],
            timestamp=event["timestamp"],
            userId=event["distinct_id"],
            eventName=event["event"],
            properties=event["properties"],
        )
        if datasource_id not in segregated_events:
            segregated_events[datasource_id] = []
        segregated_events[datasource_id].append(flutter_event)

    for datasource, flutter_events in segregated_events.items():
        app_details = app.datasource_details.get_details(datasource_id=datasource)
        app.clickhouse.save_precision_events(
            flutter_events,
            app_id=app_details.app_id,
            clickhouse_server_credentials=app_details.ch_server_credential,
        )
    logging.info("Saved flutter events")


def save_precision_events(events):
    """Saves events to Events table."""
    logging.debug(f"Saving {len(events)} precision events to events table")

    segregated_events = {}
    for event in events:
        datasource_id = event["properties"]["token"]
        cs_event = PrecisionEvent.build(
            datasourceId=datasource_id,
            timestamp=event["properties"]["$time"],
            userId=event["properties"]["$device_id"],
            eventName=event["event"],
            properties=event["properties"],
        )
        if datasource_id not in segregated_events:
            segregated_events[datasource_id] = []
        segregated_events[datasource_id].append(cs_event)
    for datasource, precision_event in segregated_events.items():
        app_details = app.datasource_details.get_details(datasource)
        app.clickhouse.save_precision_events(
            events=precision_event,
            app_id=app_details.app_id,
            clickhouse_server_credentials=app_details.ch_server_credential,
        )
    logging.info("Saved precision events")


def to_object(value: str) -> Dict:
    logging.debug(value)
    try:
        decoded_string = base64.b64decode(value).decode("utf-8", errors="ignore")
    except UnicodeDecodeError:
        logging.debug(f"Exception while decoding string: {value}")
        decoded_string = base64.b64decode(value)

    try:
        cleaned_string = (
            decoded_string.replace("\\ud83e", "")
            .replace("\\ud83c", "")
            .replace("\\ud835", "")
        )
        return json.loads(cleaned_string)
    except Exception as e:
        logging.debug(repr(e))
        traceback.print_exc()
        logging.debug(
            f"Exception while loading event string as json, skipping it: {decoded_string}"
        )


def is_valid_base64(encoded_string):
    try:
        base64.b64decode(encoded_string)
        return True
    except base64.binascii.Error:
        logging.debug(f"Skipping event {encoded_string} due to base64 encoding error.")
        return False


def generate_flutter_events_from_record(record) -> List:
    value = json.loads(record.value)
    for event in value["batch"]:
        event["datasource_id"] = value["api_key"]

    return value["batch"]


def generate_gupshup_events_from_records(record):
    """Process gupshup delivery reports."""
    events = json.loads(record.value)
    logging.info(f"Gupshup base events: {events}")
    return [
        (
            e["externalId"],
            e["eventType"],
            datetime.fromtimestamp(e["eventTs"] / 1000, tz=timezone.utc),
            e["destAddr"],
            e["srcAddr"],
            e["cause"],
            e["errorCode"],
            e["channel"],
            e.get("hsmTemplateId"),
        )
        for e in events
    ]


def generate_agent_log_events_from_records(record):
    """Process agent log events."""
    try:
        event = json.loads(record.value)
        result = [
            {
                "query_id": event["query_id"],
                "user_query": event["user_query"],
                "timestamp": datetime.fromisoformat(
                    event["timestamp"].replace("Z", "+00:00")
                ),
                "cost": event["cost"],
                "agent_calls": event["agent_calls"],
                "datasource_id": event["datasource_id"],
            }
        ]
        return result
    except (json.JSONDecodeError, KeyError, TypeError, Exception) as error:
        logging.error(f"Error processing agent log events: {error}")
        return []


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    consumer = AIOKafkaConsumer(
        *KAFKA_TOPICS,
        group_id="clickstream",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
        max_poll_interval_ms=MAX_POLL_INTERVAL_MS,
        heartbeat_interval_ms=HEARTBEAT_INTERVAL_MS,
        session_timeout_ms=SESSION_TIMEOUT_MS,
        request_timeout_ms=REQUEST_TIMEOUT_MS,
    )
    await consumer.start()
    logging.info(f"Started consumer on kafka topics: {KAFKA_TOPICS}")
    events = []
    flutter_events = []
    offsets = []
    cs_records = []
    flutter_records = []
    gupshup_records = []
    gupshup_events = []
    agent_log_records = []
    agent_log_events = []
    while True:
        # Get messages from Kafka
        data = await consumer.getmany(
            timeout_ms=TIMEOUT_MS,
            max_records=MAX_RECORDS,
        )
        if not data:
            continue

        # Decode the base64 encoded JSON
        for topic_partition, records in data.items():
            if topic_partition.topic == "clickstream":
                cs_records.extend(records)

            elif topic_partition.topic == "gupshup_delivery_report":
                gupshup_records.extend(records)

            elif topic_partition.topic == "flutter_eventstream":
                flutter_records.extend(records)

            elif topic_partition.topic == "agent_log":
                agent_log_records.extend(records)
                logging.info(f"agent_log_records: {agent_log_records}")

        if cs_records:
            _events = [
                to_object(record.value)
                for record in cs_records
                if is_valid_base64(record.value)
            ]

            _events = [e for e in _events if e]

            _offsets = [record.offset for record in cs_records]

            # Convert any non-list events to a list
            _events = [e if type(e) == list else [e] for e in _events]

            # Flatten the list of lists
            events.extend(list(reduce(lambda a, b: a + b, _events)))
            offsets.extend(_offsets)
            cs_records = []
            logging.debug(f"Collected {len(events)} clickstream events")

        if flutter_records:
            for record in flutter_records:
                flutter_events.extend(
                    generate_flutter_events_from_record(record=record)
                )

            flutter_records = []
            logging.debug(f"Collected {len(flutter_events)} flutter events")

        if gupshup_records:
            for record in gupshup_records:
                gs_events = generate_gupshup_events_from_records(record)
                gupshup_events.extend(gs_events)
            gupshup_records = []
            logging.debug(f"Gupshup events: {gupshup_events}")

        if len(gupshup_events) >= GUPSHUP_MAX_RECORDS:
            app.clickhouse.save_gupshup_events(gupshup_events)
            logging.debug(f"Saved gupshup events {gupshup_events}")
            gupshup_events = []

        if agent_log_records:
            for record in agent_log_records:
                al_events = generate_agent_log_events_from_records(record)
                agent_log_events.extend(al_events)
            agent_log_records = []
            logging.debug(f"Agent Log Events: {agent_log_events}")

        # Save events to ClickHouse
        if (len(events) + len(flutter_events) + len(agent_log_events)) >= MAX_RECORDS:
            cs_events = []
            if events:
                save_events(events)
                precision_events = [
                    event for event in events if event["event"] not in DEFAULT_EVENTS
                ]
                if len(precision_events):
                    save_precision_events(precision_events)
                cs_events = events
                events = []
                offsets = []
            if flutter_events:
                save_flutter_events(events=flutter_events)
                logging.debug(flutter_events)
                flutter_events = []
            if agent_log_events:
                app.clickhouse.save_agent_log_events(agent_log_events)
                logging.debug(f"Saved Agent Log Events: {agent_log_events}")
                agent_log_events = []

            await consumer.commit()

            if cs_events:
                app.event_properties_saver.save_cs_event_properties(events=cs_events)

                if len(precision_events):
                    logging.debug(
                        f"Comparing and saving event properties for precision events"
                    )
                    app.event_properties_saver.save_precision_event_properties(
                        precision_events=precision_events
                    )


class App:
    def __init__(self) -> None:
        self.clickhouse = ClickHouse()
        self.event_properties_saver = EventPropertiesSaver()
        self.datasource_details = DatasourceDetails()

    def connect(self) -> None:
        self.clickhouse.connect()


app = App()


async def startup_event() -> None:
    """Starts processing Kafka messages when the app starts."""
    try:
        app.connect()
        process_kafka_messages_task = asyncio.create_task(process_kafka_messages())
        await process_kafka_messages_task
    except Exception:
        logging.exception(f"Following exception has occured in process_kafka_messages")
        logging.info("Exception has occured. Shutting down consumer")
        sys.exit(1)


if __name__ == "__main__":
    logging.info("Starting Consumer Server: Clickstream")
    asyncio.run(startup_event())
