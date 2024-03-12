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
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "1"))


logging.getLogger().setLevel(logging.INFO)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")

total_records = 0

KEYS_TYPECAST_TO_STRING = os.getenv("KEYS_TYPECAST_TO_STRING", ["lat", "lng"])


def format_date_string_to_desired_format(
    date_str: str, output_date_format="%Y-%m-%d %H:%M:%S"
):
    date_formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%Y-%m-%d",
    ]

    for date_format in date_formats:
        try:
            if (
                "%f" in date_format
                and "." in date_str
                and len(date_str.split(".")[-1]) > 6
            ):
                milliseconds_part = date_str.split(".")[-1]
                digits_to_remove = len(milliseconds_part) - 6
                date_str = date_str[:-digits_to_remove]
            dt_object = datetime.strptime(date_str, date_format)
            result_date_str = dt_object.strftime(output_date_format)
            return datetime.strptime(result_date_str, output_date_format)
        except ValueError as e:
            pass

    return None


def convert_object_keys_to_string(data: dict):
    for key in data.keys():
        if key in KEYS_TYPECAST_TO_STRING:
            data[key] = str(data[key])

    return data


def fetch_values_from_kafka_records(data, event_logs_datasources: EventLogsDatasources):
    global total_records
    for _, records in data.items():
        total_records += len(records)

        for record in records:
            topic = record.topic

            if not event_logs_datasources.datasource_with_credentials.get(topic):
                logging.info(f"Bucket not found for topic: {topic}")
                continue

            if not record.value:
                continue

            values = json.loads(record.value)
            event_logs_datasources.datasource_with_credentials[
                record.topic
            ].data.append(values)


def save_topic_data_to_clickhouse(
    clickhouse, event_logs_datasources: EventLogsDatasources
):
    for (
        topic,
        bucket,
    ) in event_logs_datasources.datasource_with_credentials.items():
        table = bucket.ch_table
        database = bucket.ch_db
        clickhouse_server_credential = bucket.ch_server_credential
        app_id = bucket.app_id
        to_insert = list(filter(None, bucket.data))
        if to_insert:
            logging.info(
                f"Data present in {topic} bucket {to_insert}, Saving {len(to_insert)} entires to {database}.{table}"
            )

            columns = [
                "event_name",
                "added_time",
                "table",
                "mobile",
                "task_id",
                "account_id",
                "key",
                "data",
                "datasource_id",
            ]
            events = [
                [
                    data.get("event_name", data.get("eventName", "")),
                    format_date_string_to_desired_format(
                        data.get("added_time", data.get("addedTime"))
                    ),
                    data.get("table", ""),
                    data.get("mobile", ""),
                    data.get("task_id", ""),
                    data.get("account_id", ""),
                    data.get("key", ""),
                    convert_object_keys_to_string(data.get("data", {})),
                    data.get("datasource_id", ""),
                ]
                for data in to_insert
            ]
            logging.info(f"events: {events}")
            clickhouse.save_events(
                events=events,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=clickhouse_server_credential,
                app_id=app_id,
            )
            event_logs_datasources.datasource_with_credentials[topic].data = []
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

        fetch_values_from_kafka_records(
            data=data, event_logs_datasources=app.event_logs_datasources
        )

        if total_records > MAX_RECORDS:
            logging.info(
                f"Total records {total_records} exceed MAX_RECORDS {MAX_RECORDS}"
            )
            save_topic_data_to_clickhouse(
                clickhouse=app.clickhouse,
                event_logs_datasources=app.event_logs_datasources,
            )

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
