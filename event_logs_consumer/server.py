import asyncio
from datetime import datetime
from functools import reduce
import json
import logging
import os


from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer

from clickhouse import ClickHouse
from dotenv import load_dotenv

from event_logs_datasources import EventLogsDatasources


load_dotenv()

TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "60000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "2"))


logging.getLogger().setLevel(logging.INFO)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")

total_records = 0


def format_date_string_to_desired_format(
    date_str, output_date_format="%Y-%m-%d %H:%M:%S"
):
    date_formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S",
        "%d-%m-%Y %H:%M",
    ]

    for date_format in date_formats:
        try:
            dt_object = datetime.strptime(date_str, date_format)
            result_date_str = dt_object.strftime(output_date_format)
            return datetime.strptime(result_date_str, output_date_format)
        except ValueError:
            pass

    return None


def fetch_values_from_kafka_records(data, app):
    global total_records
    for _, records in data.items():
        total_records += len(records)

        for record in records:
            topic = record.topic

            if not app.event_logs_datasources.datasource_with_credentials.get(topic):
                logging.info(f"Bucket not found for topic: {topic}")
                continue

            if not record.value:
                continue

            values = json.loads(record.value)
            app.event_logs_datasources.datasource_with_credentials[record.topic][
                "data"
            ].append(values)


def save_topic_data_to_clickhouse(app):
    for (
        topic,
        bucket,
    ) in app.event_logs_datasources.datasource_with_credentials.items():
        table = bucket["ch_table"]
        database = bucket["ch_db"]
        clickhouse_server_credential = bucket["ch_server_credential"]
        app_id = bucket["app_id"]
        to_insert = list(filter(None, bucket["data"]))
        if to_insert:
            logging.info(
                f"Data present in {topic} bucket {to_insert}, Saving {len(to_insert)} entires to {database}.{table}"
            )

            columns = ["event", "key", "data", "added_time", "datasource_id"]
            events = [
                [
                    data.get("event", ""),
                    data.get("key", ""),
                    data.get("data", {}),
                    format_date_string_to_desired_format(
                        data.get(
                            "added_time",
                            "1970-01-01 00:00:00",
                        )
                    ),
                    data.get("datasource_id", ""),
                ]
                for data in to_insert
            ]
            logging.info(f"Inserting data : {events}")
            app.clickhouse.save_events(
                events=events,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=clickhouse_server_credential,
                app_id=app_id,
            )
            app.event_logs_datasources.datasource_with_credentials[topic]["data"] = []
            logging.info(
                "Successfully saved data to clickhouse, Emptying the topic bucket"
            )


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    app.event_logs_datasources.get_event_logs_datasources()
    logging.info(
        f"EventLogs Datsources: {app.event_logs_datasources.datasource_with_credentials}"
    )
    consumer = AIOKafkaConsumer(
        *app.event_logs_datasources.topics,
        group_id="event_logs",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
        auto_offset_reset="earliest",
    )

    global total_records
    await consumer.start()

    while True:
        data = await consumer.getmany(
            timeout_ms=TIMEOUT_MS,
            max_records=MAX_RECORDS,
        )
        if not data:
            continue

        fetch_values_from_kafka_records(data=data, app=app)

        if total_records > MAX_RECORDS:
            logging.info(
                f"Total records {total_records} exceed MAX_RECORDS {MAX_RECORDS}"
            )
            save_topic_data_to_clickhouse(app=app)

            await consumer.commit()
            total_records = 0
            app.event_logs_datasources.get_event_logs_datasources()
            logging.info(
                "Committing, setting total records to 0 and refreshing buckets"
            )


app = FastAPI()


@app.on_event("startup")
async def startup_event() -> None:
    """Starts processing Kafka messages when the app starts."""
    asyncio.create_task(process_kafka_messages())
    app.clickhouse = ClickHouse()
    app.event_logs_datasources = EventLogsDatasources()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Shuts down the app."""
    logging.info("Shutting down")
