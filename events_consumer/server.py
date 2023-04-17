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

load_dotenv()

TIMEOUT_MS = os.getenv("TIMEOUT_MS", 60000)
MAX_RECORDS = os.getenv("MAX_RECORDS", 1000)

logging.getLogger().setLevel(logging.INFO)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = "kafka:9092"
KAFKA_TOPIC = "clickstream"


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

        # Convert any non-list events to a list
        _events = [e if type(e) == list else [e] for e in _events]

        # Flatten the list of lists
        events.extend(list(reduce(lambda a, b: a + b, _events)))
        logging.info(f"Collected {len(events)} events")

        # Save events to ClickHouse
        if len(events) >= MAX_RECORDS:
            app.clickhouse.save_events(events)
            events = []
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
