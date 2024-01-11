import asyncio
import base64
from functools import reduce
import json
import logging
import os
import traceback
from typing import Dict, List

from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer

from clickhouse import ClickHouse
from dotenv import load_dotenv

from event_properties_saver import EventPropertiesSaver
from models.models import ClickStream, PrecisionEvent

load_dotenv()

TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "60000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "1000"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


logging.getLogger().setLevel(LOG_LEVEL)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.debug(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")

KAFKA_TOPICS = ["clickstream", "flutter_eventstream"]
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
    cs_events = [
        ClickStream.build(
            datasource_id=event["properties"]["token"],
            timestamp=event["properties"]["$time"],
            user_id=event["properties"]["$device_id"],
            event=event["event"],
            properties=event["properties"],
        )
        for event in events
    ]
    app.clickhouse.save_events(cs_events)
    logging.info("Saved events")


def save_flutter_events(events):
    logging.debug(f"Saving {len(events)} flutter events")
    flutter_events = [
        PrecisionEvent.build(
            datasourceId=event["datasource_id"],
            timestamp=event["timestamp"],
            userId=event["distinct_id"],
            eventName=event["event"],
            properties=event["properties"],
        )
        for event in events
    ]
    app.clickhouse.save_precision_events(flutter_events)
    logging.info("Saved flutter events")


def save_precision_events(events):
    """Saves events to Events table."""
    logging.debug(f"Saving {len(events)} precision events to events table")
    cs_events = [
        PrecisionEvent.build(
            datasourceId=event["properties"]["token"],
            timestamp=event["properties"]["$time"],
            userId=event["properties"]["$device_id"],
            eventName=event["event"],
            properties=event["properties"],
        )
        for event in events
    ]
    app.clickhouse.save_precision_events(cs_events)
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


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    consumer = AIOKafkaConsumer(
        *KAFKA_TOPICS,
        group_id="clickstream",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
    )
    await consumer.start()
    events = []
    flutter_events = []
    offsets = []
    cs_records = []
    flutter_records = []
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
            else:
                flutter_records.extend(records)

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

        # Save events to ClickHouse
        if (len(events) + len(flutter_events)) >= MAX_RECORDS:
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


app = FastAPI()


@app.on_event("startup")
async def startup_event() -> None:
    """Starts processing Kafka messages when the app starts."""
    asyncio.create_task(process_kafka_messages())
    app.clickhouse = ClickHouse()
    app.clickhouse.connect()
    app.event_properties_saver = EventPropertiesSaver()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Shuts down the app."""
    logging.debug("Shutting down")
    app.clickhouse.disconnect()
