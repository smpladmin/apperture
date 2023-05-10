import asyncio
from base64 import b64decode
from functools import reduce
import json
import logging
import os
from typing import Dict

from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer

from clickhouse import ClickHouse
from dotenv import load_dotenv

from models.models import ClickStream, PrecisionEvent

load_dotenv()

TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "60000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "1000"))

logging.getLogger().setLevel(logging.INFO)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = "kafka:9092"
KAFKA_TOPIC = "clickstream"
DEFAULT_EVENTS = [
    "$autocapture",
    "$pageview",
    "$pageleave",
    "$identify",
    "$rageclick",
]


def save_events(events):
    """Saves events to ClickHouse."""
    logging.info(f"Saving {len(events)} events")
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


def save_precision_events(events):
    """Saves events to Events table."""
    logging.info(f"Saving {len(events)} events")
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
    app.clickhouse.save_events(cs_events)
    logging.info("Saved precision events")


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    consumer = AIOKafkaConsumer(
        KAFKA_TOPIC,
        group_id="clickstream",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
    )
    await consumer.start()
    events = []
    offsets = []
    while True:
        # Get messages from Kafka
        data = await consumer.getmany(
            timeout_ms=TIMEOUT_MS,
            max_records=MAX_RECORDS,
        )
        if not data:
            continue

        # Decode the base64 encoded JSON
        _events = [
            json.loads(b64decode(record.value))
            for _, records in data.items()
            for record in records
        ]

        _offsets = [record.offset for _, records in data.items() for record in records]

        # Convert any non-list events to a list
        _events = [e if type(e) == list else [e] for e in _events]

        # Flatten the list of lists
        events.extend(list(reduce(lambda a, b: a + b, _events)))
        offsets.extend(_offsets)
        logging.info(f"Collected {len(events)} events")

        # Save events to ClickHouse
        if len(events) >= MAX_RECORDS:
            logging.info(f"Saving events: {events} with offsets: {offsets}")
            save_events(events)
            precision_events = [
                event for event in events if event["event"] not in DEFAULT_EVENTS
            ]
            if len(save_precision_events):
                logging.info(f"Saving precision events: {precision_events}")
                save_precision_events(precision_events)
            events = []
            offsets = []
            await consumer.commit()


app = FastAPI()


@app.on_event("startup")
async def startup_event() -> None:
    """Starts processing Kafka messages when the app starts."""
    asyncio.create_task(process_kafka_messages())
    app.clickhouse = ClickHouse()
    app.clickhouse.connect()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Shuts down the app."""
    logging.info("Shutting down")
    app.clickhouse.disconnect()
