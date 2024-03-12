import asyncio
from datetime import datetime
import json
import logging
from cache import init_cache
from clickhouse.clickhouse import ClickHouse
import numpy as np

import pandas as pd
from domain.alerts.service import AlertService
from models.models import EventTablesBucket
from jsonpath_ng import parse

from fastapi import FastAPI
from aiokafka import AIOKafkaConsumer

from events_config import EventTablesConfig
from settings import events_settings

settings = events_settings()

TIMEOUT_MS = settings.timeout_ms
MAX_RECORDS = settings.max_records
KAFKA_BOOTSTRAP_SERVERS = settings.kafka_bootstrap_servers.split(",")
AUTO_OFFSET_RESET = settings.auto_offset_reset

logging.getLogger().setLevel(logging.INFO)
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")
logging.info(f"AUTO_OFFSET_RESET: {AUTO_OFFSET_RESET}")

total_records = 0


def format_date_string_to_desired_format(
    date_str: str, output_date_format="%Y-%m-%d %H:%M:%S"
):
    date_formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%d-%m-%Y",
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


def create_sparse_dataframe(
    df: pd.DataFrame,
    values,
    columns_with_types: dict,
    event_table_bucket: EventTablesBucket,
    alert_service: AlertService,
):
    event_name = values.get("eventName", values.get("event_name"))
    primary_key = event_table_bucket.primary_key
    config = event_table_bucket.table_config
    result_dict = {}
    columns = list(columns_with_types.keys())

    for item in config:
        if item["event"] == event_name:
            id_path = item["id_path"]
            source_path = item["source_path"]
            destination_column = item["destination_column"]

            # Extracting id from id_path
            try:
                jsonpath_expr_id = parse(id_path)
                id_value = [match.value for match in jsonpath_expr_id.find(values)][0]
            except:
                error_message = f"Id at path {id_path} not found for event {values}."
                alert_service.post_message_to_slack(
                    message=error_message, alert_type="Invalid ID"
                )

            # Extracting value from source_path
            jsonpath_expr_value = parse(source_path)
            value = [match.value for match in jsonpath_expr_value.find(values)]
            column_value = value[0] if value else None

            result_dict[primary_key] = id_value
            result_dict[destination_column] = column_value

    df_row = pd.DataFrame([result_dict])
    existing_row = df[df[primary_key] == result_dict[primary_key]]

    # If id already exists in the DataFrame, update the row; otherwise, append the row
    if not existing_row.empty:
        for column in columns[1:]:
            if result_dict.get(column) is not None:
                df.loc[df[primary_key] == result_dict[primary_key], column] = (
                    result_dict[column]
                )
    else:
        df = pd.concat([df, df_row], ignore_index=True)

    # typecast columns
    for column, dtype in columns_with_types.items():
        if dtype == "datetime64[ns]":
            df[column] = df[column].apply(
                lambda date: (
                    format_date_string_to_desired_format(str(date))
                    if pd.notnull(date)
                    else None
                )
            )
        elif dtype == "object":
            df[column] = df[column].apply(
                lambda value: (
                    json.loads(value)
                    if pd.notnull(value) and isinstance(value, str)
                    else value
                )
            )
        else:
            df[column] = df[column].astype(dtype, errors="ignore")

    # replace nan values with None
    df.replace({np.nan: None}, inplace=True)
    logging.info(f"Sparse dataframe: {df}")

    return df


def convert_clickhouse_result_to_dict(primary_key_column, clickhouse_data):
    # Convert ClickHouse data array of dict into a dictionary with primary key as the key
    clickhouse_dict = {entry[primary_key_column]: entry for entry in clickhouse_data}
    return clickhouse_dict


def enrich_sparse_dataframe(
    df: pd.DataFrame,
    primary_key_column: str,
    table: str,
    event_tables_config: EventTablesConfig,
    database: str,
    ch_server_credential,
    app_id: str,
) -> pd.DataFrame:
    # Find unique 'id' values with None values in any column in the DataFrame
    ids_to_enrich = (
        df[df.isna().any(axis=1)]
        .dropna(subset=[primary_key_column])[primary_key_column]
        .unique()
    )

    if len(ids_to_enrich):
        clickhouse_data = event_tables_config.get_row_values(
            id=primary_key_column,
            id_values=ids_to_enrich,
            table=table,
            database=database,
            ch_server_credential=ch_server_credential,
            app_id=app_id,
        )

        clickhouse_dict = convert_clickhouse_result_to_dict(
            primary_key_column=primary_key_column, clickhouse_data=clickhouse_data
        )

        # Update the DataFrame with the enriched values
        for index, row in df.iterrows():
            id_value = row[primary_key_column]
            if id_value in ids_to_enrich:
                for column in df.columns:
                    # Skip primary key column
                    if column == primary_key_column:
                        continue
                    # For only None column value, replace it with data from clickhouse result, otherwise keep it as it is
                    if pd.isnull(row[column]):
                        new_value = clickhouse_dict.get(id_value, {}).get(column, None)
                        df.at[index, column] = new_value

        logging.info(f"Enriched dataframe: {df}")
        return df


def fetch_values_from_kafka_records(
    data, event_tables_config: EventTablesConfig, alert_service: AlertService
):
    global total_records

    for topic_partition, records in data.items():
        topic = topic_partition.topic

        if not event_tables_config.event_tables.get(topic):
            logging.info(f"Bucket not found for topic: {topic}")
            continue

        event_table_bucket = event_tables_config.event_tables.get(topic)
        table = event_table_bucket.ch_table

        total_records += len(records)
        columns_with_types = event_table_bucket.columns_with_types
        columns = list(columns_with_types.keys())

        primary_key = event_table_bucket.primary_key
        df = pd.DataFrame(columns=columns)

        for record in records:
            topic = record.topic

            if not record.value:
                continue

            values = json.loads(record.value)
            df = create_sparse_dataframe(
                df=df,
                values=values,
                columns_with_types=columns_with_types,
                event_table_bucket=event_table_bucket,
                alert_service=alert_service,
            )

        enrich_df = enrich_sparse_dataframe(
            df=df,
            primary_key_column=primary_key,
            table=table,
            event_tables_config=event_tables_config,
            database=event_table_bucket.ch_db,
            ch_server_credential=event_table_bucket.ch_server_credential,
            app_id=event_table_bucket.app_id,
        )

        event_tables_config.event_tables[topic].data = enrich_df


def save_topic_data_to_clickhouse(clickhouse, event_tables_config: EventTablesConfig):
    for (
        topic,
        bucket,
    ) in event_tables_config.event_tables.items():
        table = bucket.ch_table
        database = bucket.ch_db
        table_data = bucket.data
        save_to_audit_table = bucket.save_to_audit_table

        if not table_data.empty:
            data = table_data.values.tolist()
            columns = table_data.columns.tolist()

            logging.info(
                f"Data present in {topic} bucket {data}, Saving {len(data)} entires to {database}.{table}"
            )
            clickhouse.save_events(
                events=data,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=bucket.ch_server_credential,
                app_id=bucket.app_id,
            )

            if save_to_audit_table:
                audit_table = f"{table}_audit"
                logging.info(f"Saving audit data {data} in {database}.{audit_table}")
                clickhouse.save_events(
                    events=data,
                    columns=columns,
                    table=audit_table,
                    database=database,
                    clickhouse_server_credential=bucket.ch_server_credential,
                    app_id=bucket.app_id,
                )
            event_tables_config.event_tables[topic].data = pd.DataFrame()
            logging.info(
                "Successfully saved data to clickhouse, Emptying the topic bucket"
            )


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    await app.event_tables_config.get_topics_from_event_config()
    logging.info(f"Event Configs: {app.event_tables_config.event_tables}")
    consumer = AIOKafkaConsumer(
        *app.event_tables_config.topics,
        group_id="event_logs",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
        auto_offset_reset=AUTO_OFFSET_RESET,
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
            data=data,
            event_tables_config=app.event_tables_config,
            alert_service=app.alert_service,
        )

        if total_records > MAX_RECORDS:
            logging.info(
                f"Total records {total_records} exceed MAX_RECORDS {MAX_RECORDS}"
            )
            save_topic_data_to_clickhouse(
                clickhouse=app.clickhouse,
                event_tables_config=app.event_tables_config,
            )

            await consumer.commit()
            total_records = 0
            await app.event_tables_config.get_topics_from_event_config()
            logging.info(
                "Committing, setting total records to 0 and refreshing buckets"
            )


app = FastAPI()


@app.on_event("startup")
async def startup_event() -> None:
    init_cache(redis_host=settings.redis_host, redis_password=settings.redis_password)
    """Starts processing Kafka messages when the app starts."""
    asyncio.create_task(process_kafka_messages())
    app.clickhouse = ClickHouse()
    app.event_tables_config = EventTablesConfig()
    app.alert_service = AlertService()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Shuts down the app."""
    logging.info("Shutting down")
