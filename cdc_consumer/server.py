import os
import json
import asyncio
import logging
import sys

from aiokafka import AIOKafkaConsumer
from dotenv import load_dotenv

from cdc_integrations import CDCIntegrations
from clickhouse import ClickHouse

load_dotenv()
logging.getLogger().setLevel(logging.INFO)

TIMEOUT_MS = int(os.getenv("TIMEOUT_MS", "600000"))
MAX_RECORDS = int(os.getenv("MAX_RECORDS", "10000"))
AUTO_OFFSET_RESET = os.getenv("AUTO_OFFSET_RESET", "latest")
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")


def get_id_from_mac_id(mac_id):
    result = 0
    for char in mac_id:
        result = result * 256 + ord(char)

    return result & ((1 << 256) - 1)


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    app.cdc_integrations.get_cdc_integrations()
    logging.info(f"CDC Integrations: {app.cdc_integrations.cdc_buckets}")

    consumer = AIOKafkaConsumer(
        *app.cdc_integrations.topics,
        group_id="cdc",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        auto_offset_reset=AUTO_OFFSET_RESET,
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
    )
    logging.info(f"Started consumer on kafka topics: {app.cdc_integrations.topics}")

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
                topic = record.topic
                if not app.cdc_integrations.cdc_buckets.get(topic):
                    logging.info(f"Bucket not found for topic: {topic}")
                    continue

                if not record.value:
                    # logging.info(f"Value not present for record: {record}")
                    continue
                values = json.loads(record.value)
                after = values["payload"].get("after")
                before = values["payload"].get("before")
                shard = app.cdc_integrations.cdc_buckets[record.topic]["shard"]
                ch_table = app.cdc_integrations.cdc_buckets[record.topic]["ch_table"]

                # Temporary workaround for the 't_device' table: Due to a specific issue,
                # manually assign an ID to each record based on the 'device_id' field as it was the need of the hour.
                # TODO: Implement a more robust solution and introduce a flag to handle
                # such cases in a cleaner and sustainable way.
                if ch_table == "t_device":
                    if after:
                        after["id"] = get_id_from_mac_id(after.get("mac"))
                    elif before:
                        before["id"] = get_id_from_mac_id(before.get("mac"))

                if after:
                    after["is_deleted"] = 0
                    after["shard"] = shard
                    app.cdc_integrations.cdc_buckets[record.topic]["data"].append(after)
                elif before:
                    # logging.info(f"Deleting Row: {before}")
                    before["is_deleted"] = 1
                    before["shard"] = shard
                    app.cdc_integrations.cdc_buckets[record.topic]["data"].append(
                        before
                    )
                else:
                    # logging.info("Skipping, before and after values not present in payload")
                    continue

        if total_records > MAX_RECORDS:
            logging.info(
                f"Total records {total_records} exceed MAX_RECORDS {MAX_RECORDS}"
            )
            for topic, bucket in app.cdc_integrations.cdc_buckets.items():
                table = bucket["ch_table"]
                database = bucket["ch_db"]
                clickhouse_server_credential = bucket["ch_server_credential"]
                app_id = bucket["app_id"]

                to_insert = list(filter(None, bucket["data"]))
                if to_insert:
                    logging.info(
                        f"Inserting data for topic {topic} into {table} table of {database}"
                    )
                    logging.info(
                        f"Data present in {topic} bucket len: {len(to_insert)}, Saving to clickhouse"
                    )
                    columns = to_insert[0].keys()
                    events = [data.values() for data in to_insert]
                    app.clickhouse.save_events(
                        events=events,
                        columns=columns,
                        table=table,
                        database=database,
                        clickhouse_server_credential=clickhouse_server_credential,
                        app_id=app_id,
                    )
                    logging.info(
                        "Successfully saved data to clickhouse, Emptying the topic bucket"
                    )

            logging.info(
                "Committing, setting total records to 0 and refreshing buckets"
            )
            await consumer.commit()
            total_records = 0
            app.cdc_integrations.get_cdc_integrations()


class App:
    def __init__(self) -> None:
        self.clickhouse = ClickHouse()
        self.cdc_integrations = CDCIntegrations()


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
    logging.info("Starting Consumer Server: cdc")
    asyncio.run(startup_event())
