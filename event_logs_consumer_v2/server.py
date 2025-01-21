import asyncio
from datetime import datetime
from functools import reduce
import json
import ast
import logging
import os
import sys


from aiokafka import AIOKafkaConsumer

from clickhouse import ClickHouse
from dotenv import load_dotenv

from event_logs_datasources import EventLogsDatasources


load_dotenv()

TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "60000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "10"))
MAX_POLL_INTERVAL_MS = int(os.getenv("MAX_POLL_INTERVAL_MS", 300000))
SESSION_TIMEOUT_MS = int(os.getenv("SESSION_TIMEOUT_MS", 10000))
HEARTBEAT_INTERVAL_MS = int(os.getenv("HEARTBEAT_INTERVAL_MS", 3000))
REQUEST_TIMEOUT_MS = int(os.getenv("REQUEST_TIMEOUT_MS", 40 * 1000))
AUTO_OFFSET_RESET = os.getenv("AUTO_OFFSET_RESET", "latest")


logging.getLogger().setLevel(logging.INFO)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")

EVENTS_TO_SKIP = json.loads(os.getenv("EVENTS_TO_SKIP", "[]"))
TABLES_TO_SKIP = json.loads(os.getenv("TABLES_TO_SKIP", "[]"))

logging.info(f"EVENTS_TO_SKIP: {EVENTS_TO_SKIP}")
logging.info(f"TABLES_TO_SKIP: {TABLES_TO_SKIP}")

total_records = 0


def format_date_string_to_desired_format(
    date_str: str, output_date_format="%Y-%m-%d %H:%M:%S"
):
    if not date_str:
        return

    date_formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%Y-%m-%d",
        "%Y-%m-%dT%H:%M:%S%z",
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


def fetch_values_from_kafka_records(data, event_logs_datasources: EventLogsDatasources):
    global total_records

    for _, records in data.items():
        total_records += len(records)

        for record in records:
            topic = record.topic
            table_buckets = event_logs_datasources.datasource_with_credentials[
                topic
            ].table_data

            if not event_logs_datasources.datasource_with_credentials.get(topic):
                logging.info(f"Bucket not found for topic: {topic}")
                continue

            if not record.value:
                continue

            values = json.loads(record.value)
            table_name = values.get("table", "")

            if table_name not in table_buckets:
                table_buckets[table_name] = []

            table_buckets[table_name].append(values)
            event_logs_datasources.datasource_with_credentials[topic].table_data = (
                table_buckets
            )


def save_topic_data_to_clickhouse(
    clickhouse, event_logs_datasources: EventLogsDatasources
):
    for (
        topic,
        bucket,
    ) in event_logs_datasources.datasource_with_credentials.items():
        for table_name, events in bucket.table_data.items():

            if not events:
                continue  # Skip if there are no events in this bucket

            logging.info(
                f"Data present in {topic} bucket for table {table_name}: {events}"
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
                "source_flag",
            ]
            formatted_events = [
                [
                    data.get("event_name", data.get("eventName", "")),
                    format_date_string_to_desired_format(
                        data.get("added_time", data.get("addedTime")),
                        output_date_format="%Y-%m-%d %H:%M:%S.%f",
                    ),
                    data.get("table", ""),
                    data.get("mobile", ""),
                    data.get("task_id", ""),
                    data.get("account_id", ""),
                    data.get("key", ""),
                    json.dumps(data.get("data", {})),
                    data.get("datasource_id", ""),
                    data.get("source_flag", None),
                ]
                for data in events
                if (
                    data.get("event_name", data.get("eventName", ""))
                    not in EVENTS_TO_SKIP
                    and data.get("table", "") not in TABLES_TO_SKIP
                )  # Check added to skip some events
            ]
            clickhouse.create_table(
                database=bucket.ch_db,
                table=table_name,
                clickhouse_server_credential=bucket.ch_server_credential,
                app_id=bucket.app_id,
            )
            clickhouse.save_events(
                events=formatted_events,
                columns=columns,
                table=table_name,
                database=bucket.ch_db,
                clickhouse_server_credential=bucket.ch_server_credential,
                app_id=bucket.app_id,
            )
            logging.info(
                f"Successfully saved {len(events)} in table {table_name}. Events: {formatted_events}"
            )
        event_logs_datasources.datasource_with_credentials[topic].table_data = {}


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    app.event_logs_datasources.get_event_logs_datasources()
    logging.info(
        f"EventLogs Datsources: {app.event_logs_datasources.datasource_with_credentials}"
    )
    consumer = AIOKafkaConsumer(
        *app.event_logs_datasources.topics,
        group_id="event_logs_v2",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        max_poll_interval_ms=MAX_POLL_INTERVAL_MS,
        heartbeat_interval_ms=HEARTBEAT_INTERVAL_MS,
        session_timeout_ms=SESSION_TIMEOUT_MS,
        request_timeout_ms=REQUEST_TIMEOUT_MS,
        auto_offset_reset=AUTO_OFFSET_RESET,
    )
    logging.info(
        f"Started consumer on kafka topics: {app.event_logs_datasources.topics}"
    )

    global total_records
    await consumer.start()
    logging.info(f"Starting consumer")

    while True:
        data = await consumer.getmany(
            timeout_ms=TIMEOUT_MS,
            max_records=MAX_RECORDS,
        )
        if not data:
            continue
        logging.info(f"Fetched {len(data)} messages")

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
            logging.info(f"Successfully saved {total_records} records")

            await consumer.commit()
            total_records = 0
            app.event_logs_datasources.get_event_logs_datasources()
            logging.info(
                "---Committing, setting total records to 0 and refreshing buckets---"
            )


class App:
    def __init__(self) -> None:
        self.clickhouse = ClickHouse()
        self.event_logs_datasources = EventLogsDatasources()


app = App()


async def startup_event() -> None:
    """Starts processing Kafka messages when the app starts."""
    try:
        process_kafka_messages_task = asyncio.create_task(process_kafka_messages())
        await process_kafka_messages_task
    except Exception:
        logging.exception(f"Following exception has occured in process_kafka_messages")
        logging.info("Exception has occured. Shutting down consumer")
        sys.exit(1)


if __name__ == "__main__":
    logging.info("Starting Consumer Server: EventLogs V2")
    asyncio.run(startup_event())
