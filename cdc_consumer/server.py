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
logging.getLogger().setLevel(logging.INFO)

TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "60000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "10000"))
AUTO_OFFSET_RESET = os.getenv("AUTO_OFFSET_RESET", "latest")


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    app.cdc_integrations.get_cdc_integrations()
    logging.info(f"CDC Integrations: {app.cdc_integrations.cdc_buckets}")

    consumer = AIOKafkaConsumer(
        *app.cdc_integrations.topics,
        group_id="cdc",
        bootstrap_servers="kafka:9092",
        auto_offset_reset=AUTO_OFFSET_RESET,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
    )

    await consumer.start()

    total_records = 0
    while True:
        # Get messages from Kafka
        data = await consumer.getmany(
            timeout_ms=TIMEOUT_MS,
            max_records=MAX_RECORDS,
        )
        if not data:
            logging.info("data not present")
            continue

        for _, records in data.items():
            total_records += len(records)
            for record in records:
                if not app.cdc_integrations.cdc_buckets.get(record.topic):
                    logging.info(
                        f"Bucket not found for topic: {record.topic}, Fetching CDC Integrations"
                    )
                    app.cdc_integrations.get_cdc_integrations()
                logging.info(f"Pushing data to {record.topic} bucket")
                app.cdc_integrations.cdc_buckets[record.topic]["data"].append(
                    json.loads(record.value)["payload"].get("after")
                )

        if total_records > MAX_RECORDS:
            logging.info(
                f"Total records {total_records} exceed MAX_RECORDS {MAX_RECORDS}"
            )
            for topic, bucket in app.cdc_integrations.cdc_buckets.items():
                table = bucket["ch_table"]
                database = bucket["ch_db"]
                logging.info(
                    f"Inserting data for topic {topic} into {table} table of {database}"
                )
                to_insert = bucket["data"]
                if to_insert:
                    logging.info(f"Data present in {topic} bucket len: {len(to_insert)}, Saving to clickhouse")
                    columns = to_insert[0].keys()
                    events = [data.values() for data in to_insert]
                    app.clickhouse.save_events(
                        events=events,
                        columns=columns,
                        table=table,
                        database=database,
                    )
                    logging.info(
                        "Successfully saved data to clickhouse, Emptying the topic bucket"
                    )

            total_records = 0
            app.cdc_integrations.get_cdc_integrations()
            logging.info("Setting total records to 0, refreshing buckets and committing")
            await consumer.commit()


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
