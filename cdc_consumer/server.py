import os
import json
import asyncio
import logging

from aiokafka import AIOKafkaConsumer
from dotenv import load_dotenv
from fastapi import FastAPI

from cdc_integrations import CDCIntegrations
from clickhouse import ClickHouse

load_dotenv()

TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "60000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "10"))


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    app.cdc_integrations.get_cdc_integrations()

    consumer = AIOKafkaConsumer(
        # *app.cdc_integrations.topics,
        *[
            "cdc_6502ddb0d27c13479d657e5e.test_db.dbo.industry",
            "cdc_6502ddb0d27c13479d657e5e.test_db.dbo.users",
        ],
        # group_id="1",
        bootstrap_servers="kafka:9092",
        auto_offset_reset="earliest",
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
    )
    await consumer.start()

    while True:
        # Get messages from Kafka
        data = await consumer.getmany(
            timeout_ms=TIMEOUT_MS,
            max_records=MAX_RECORDS,
        )
        if not data:
            # logging.info("data not present")
            continue

        for _, records in data.items():
            for record in records:
                app.cdc_integrations.cdc_buckets[record.topic]["data"].append(
                    json.loads(record.value)["payload"].get("after")
                )

        for topic, bucket in app.cdc_integrations.cdc_buckets.items():
            table = bucket["ch_table"]
            database = bucket["ch_db"]
            logging.info(
                f"Inserting data for topic {topic} into {table} table of {database}"
            )
            to_insert = bucket["data"]
            if len(to_insert) > 4:
                columns = to_insert[0].keys()
                events = [data.values() for data in to_insert]
                app.clickhouse.save_events(
                    events=events,
                    columns=columns,
                    table=table,
                    database=database,
                )
                bucket["data"] = []


app = FastAPI()


@app.on_event("startup")
async def startup_event() -> None:
    """Starts processing Kafka messages when the app starts."""
    asyncio.create_task(process_kafka_messages())
    app.clickhouse = ClickHouse()
    app.clickhouse.connect()
    app.cdc_integrations = CDCIntegrations()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Shuts down the app."""
    logging.info("Shutting down")
    app.clickhouse.disconnect()
