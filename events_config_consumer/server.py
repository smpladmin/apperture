import asyncio
from datetime import datetime
import json
import ast
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
MAX_POLL_INTERVAL_MS = settings.max_poll_interval_ms

logging.getLogger().setLevel(logging.INFO)
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")
logging.info(f"AUTO_OFFSET_RESET: {AUTO_OFFSET_RESET}")
logging.info(f"MAX_POLL_INTERVAL_MS: {MAX_POLL_INTERVAL_MS}")

total_records = 0


def format_date_string_to_desired_format(
    date_str: str, output_date_format="%Y-%m-%d %H:%M:%S"
):
    date_formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S",
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


def convert_string_value_to_object(value):
    """
    The string representation '["i1"]' can be successfully parsed by json.loads(),
    but the string representation "['i1']" will fail due to the use of single quotes instead
    of double quotes around strings, causing a JSONDecodeError. In such cases, ast.literal_eval()
    can be used as a fallback to handle the conversion.
    """
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError, ValueError):
        try:
            return ast.literal_eval(value)
        except (SyntaxError, ValueError):
            return value


def typecast_columns(df, audit_df, columns_with_types):
    for column, column_type in columns_with_types.items():
        if column_type == "datetime64[ns]":
            df[column] = df[column].apply(
                lambda date: (
                    date
                    if isinstance(date, datetime)
                    else (
                        format_date_string_to_desired_format(str(date))
                        if pd.notnull(date)
                        else None
                    )
                )
            )
            audit_df[column] = audit_df[column].apply(
                lambda date: (
                    date
                    if isinstance(date, datetime)
                    else (
                        format_date_string_to_desired_format(str(date))
                        if pd.notnull(date)
                        else None
                    )
                )
            )

        elif column_type == "object":
            df[column] = df[column].apply(convert_string_value_to_object)
            audit_df[column] = audit_df[column].apply(convert_string_value_to_object)
        else:
            df[column] = df[column].astype(column_type, errors="ignore")
            audit_df[column] = audit_df[column].astype(column_type, errors="ignore")

    # replace NaN values with None
    df.replace({np.nan: None}, inplace=True)
    audit_df.replace({np.nan: None}, inplace=True)

    return df, audit_df


def convert_lists_and_dicts_to_strings(dictionary, columns_with_types):
    """
    Convert any lists or dictionaries in the dictionary to their string representations
    """
    converted_dict = {}
    for key, value in dictionary.items():
        col_type = columns_with_types.get(key)
        # If the column type is "string" and the value coming from upstream is not a string,
        # convert the value to a string
        if col_type == "string" and not isinstance(value, str):
            converted_dict[key] = str(value)
        elif isinstance(value, (list, dict)):
            converted_dict[key] = str(value)
        else:
            converted_dict[key] = value
    return converted_dict


def create_sparse_dataframe(
    df: pd.DataFrame,
    audit_df: pd.DataFrame,
    event,
    columns_with_types: dict,
    event_table_bucket: EventTablesBucket,
):
    primary_key = event_table_bucket.primary_key
    config = event_table_bucket.table_config
    result_dict = {}
    columns = list(columns_with_types.keys())

    id_path = config["id_path"]
    column_mapping = config["column_mapping"]

    for column in column_mapping:
        jsonpath_expr_id = parse(id_path)
        id_value = [match.value for match in jsonpath_expr_id.find(event)][0]

        destination_column, source_path = list(column.items())[0]

        # Extracting value from source_path
        jsonpath_expr_value = parse(source_path)
        value = [match.value for match in jsonpath_expr_value.find(event)]
        column_value = value[0] if value else None

        result_dict[primary_key] = id_value
        result_dict[destination_column] = column_value

    # Add "latest_added_time" column to the result dictionary.
    # Since "latest_added_time" is not explicitly mentioned in the configuration, it's treated as equivalent to "modified_time".
    # Therefore, intialize "latest_added_time" with "added_time" and later update it.
    result_dict["latest_added_time"] = result_dict["added_time"]
    result_dict = convert_lists_and_dicts_to_strings(result_dict, columns_with_types)

    df_row = pd.DataFrame([result_dict], columns=df.columns)
    existing_row = df[df[primary_key].astype(str) == str(result_dict[primary_key])]

    if event_table_bucket.save_to_audit_table:
        logging.info(f"Adding row {df_row.to_string()}.")
        audit_df = pd.concat([audit_df, df_row], ignore_index=True)

    # If id already exists in the DataFrame, update the row; otherwise, append the row
    if not existing_row.empty:
        for column in columns:
            if result_dict.get(column) is not None:
                if column == "added_time":
                    # Update added_time with the minimum value between existing and result_dict value
                    result_dict[column] = (
                        min(
                            existing_row[column].iloc[0],
                            format_date_string_to_desired_format(result_dict[column]),
                        )
                        if existing_row[column] is not None
                        else result_dict[column]
                    )
                elif column == "latest_added_time":
                    # Update latest_added_time with the maximum value between existing and result_dict value
                    result_dict[column] = (
                        max(
                            existing_row[column].iloc[0],
                            format_date_string_to_desired_format(result_dict[column]),
                        )
                        if existing_row[column] is not None
                        else result_dict[column]
                    )
                df.loc[
                    df[primary_key].astype(str) == str(result_dict[primary_key]), column
                ] = result_dict[column]
    else:
        df = pd.concat([df, df_row], ignore_index=True)
    df, audit_df = typecast_columns(
        df=df, audit_df=audit_df, columns_with_types=columns_with_types
    )

    return df, audit_df


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
    # Find unique 'id' values for primary key column in the DataFrame
    clickhouse_data = event_tables_config.get_row_values(
        id=primary_key_column,
        id_values=df[primary_key_column].unique(),
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
        for column in df.columns:
            # Skip primary key column
            if column == primary_key_column:
                continue
            # For only None or empty string column value, replace it with data from ClickHouse result, otherwise keep it as it is
            if (
                pd.isnull(row[column])
                or row[column] == ""
                or column in ["added_time", "latest_added_time"]
            ):
                new_value = clickhouse_dict.get(id_value, {}).get(column, None)
                if column == "added_time":
                    # Update added_time with minimum value between existing ClickHouse value and one in df
                    new_value = (
                        min(row["added_time"], new_value)
                        if new_value is not None
                        else row["added_time"]
                    )
                elif column == "latest_added_time":
                    # Update latest_added_time with maximum value between existing ClickHouse value and one in df
                    new_value = (
                        max(row["latest_added_time"], new_value)
                        if new_value is not None
                        else row["latest_added_time"]
                    )
                df.at[index, column] = new_value

    return df


def get_destination_tables_for_event(event_name, config):
    table_names = []
    for table_name, table_config in config.items():
        if event_name in table_config.get("events", []):
            table_names.append(table_name)
    return table_names


def process_event_buckets(
    event_tables_config: EventTablesConfig, alert_service: AlertService
):
    """
    Process event buckets stored in the event tables configuration.
    """
    for topic, bucket in event_tables_config.event_tables.items():
        table = bucket.ch_table
        events = bucket.events
        columns_with_types = bucket.columns_with_types
        primary_key = bucket.primary_key
        table_config = bucket.table_config

        # Initialize DataFrames with topic's data to avoid losing intermediate values
        df = bucket.data
        audit_df = bucket.audit_data

        for event in events:
            id_path = table_config["id_path"]
            jsonpath_expr_id = parse(id_path)
            value = [match.value for match in jsonpath_expr_id.find(event)]
            id_value = value[0] if value else None

            if not id_value:
                error_message = f"Id at path {id_path} not found for event {event}."
                logging.info(error_message)
                alert_service.post_message_to_slack(
                    message=error_message, alert_type="Invalid ID"
                )
                continue

            df, audit_df = create_sparse_dataframe(
                df=df,
                audit_df=audit_df,
                event=event,
                columns_with_types=columns_with_types,
                event_table_bucket=bucket,
            )

        logging.info(f"Sparse dataframe: {df.to_string()}")
        logging.info(f"Audit dataframe: {audit_df.to_string()}")

        if df.empty:
            logging.info("Empty sparse dataframe. Skip enrichment.")
            continue

        enrich_df = enrich_sparse_dataframe(
            df=df,
            primary_key_column=primary_key,
            table=table,
            event_tables_config=event_tables_config,
            database=bucket.ch_db,
            ch_server_credential=bucket.ch_server_credential,
            app_id=bucket.app_id,
        )

        logging.info(f"Enriched dataframe: {df.to_string()}")

        bucket.data = enrich_df
        bucket.audit_data = audit_df
        bucket.events = []


def fetch_values_from_kafka_records(
    data, event_tables_config: EventTablesConfig, alert_service: AlertService
):
    global total_records

    for topic_partition, records in data.items():
        total_records += len(records)

        for record in records:
            topic = record.topic
            if not record.value:
                continue

            values = json.loads(record.value)
            logging.info(f"Values for topic {topic}::{values}")
            events_config = event_tables_config.events_config
            destination_tables = get_destination_tables_for_event(
                event_name=values["eventName"], config=events_config
            )
            if not destination_tables:
                logging.info(f"No destination tables found for {values}.")
                continue

            # Group events into distinct buckets depending on their destination tables in the configuration.
            for table in destination_tables:
                table_topic = f"{topic}_{table}"
                event_tables_config.event_tables[table_topic].events.append(values)

        process_event_buckets(
            event_tables_config=event_tables_config, alert_service=alert_service
        )


def save_topic_data_to_clickhouse(clickhouse, event_tables_config: EventTablesConfig):
    for (
        topic,
        bucket,
    ) in event_tables_config.event_tables.items():
        table = bucket.ch_table
        database = bucket.ch_db
        table_data = bucket.data
        audit_table_data = bucket.audit_data
        save_to_audit_table = bucket.save_to_audit_table

        if table_data is not None and not table_data.empty:
            data = table_data.values.tolist()
            columns = table_data.columns.tolist()

            logging.info(
                f"Data present in {topic} bucket {data}, Saving {len(data)} entires to {database}.{table}"
            )
            logging.info(
                f"Saving table data {data} in {database}.{table} with columns {columns}"
            )

            clickhouse.save_events(
                events=data,
                columns=columns,
                table=table,
                database=database,
                clickhouse_server_credential=bucket.ch_server_credential,
                app_id=bucket.app_id,
            )
            event_tables_config.event_tables[topic].data = pd.DataFrame(columns=columns)

        # Check if the data needs to be saved in audit table is not null or empty
        if (
            save_to_audit_table
            and audit_table_data is not None
            and not audit_table_data.empty
        ):
            audit_table = f"{table}_audit"
            audit_data = audit_table_data.values.tolist()
            columns = audit_table_data.columns.tolist()
            logging.info(f"Saving audit data {audit_data} in {database}.{audit_table}")
            clickhouse.save_events(
                events=audit_data,
                columns=columns,
                table=audit_table,
                database=database,
                clickhouse_server_credential=bucket.ch_server_credential,
                app_id=bucket.app_id,
            )

            event_tables_config.event_tables[topic].audit_data = pd.DataFrame(
                columns=columns
            )
        logging.info("Successfully saved data to clickhouse, Emptying the topic bucket")


async def process_kafka_messages() -> None:
    """Processes Kafka messages and inserts them into ClickHouse.."""
    await app.event_tables_config.get_topics_from_event_config()
    logging.info(f"Event Configs: {app.event_tables_config.event_tables}")
    consumer = AIOKafkaConsumer(
        *app.event_tables_config.topics,
        group_id="events_config",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        value_deserializer=lambda v: v.decode("utf-8"),
        enable_auto_commit=False,
        fetch_max_bytes=7864320,
        auto_offset_reset=AUTO_OFFSET_RESET,
        max_poll_interval_ms=MAX_POLL_INTERVAL_MS,
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

        if total_records >= MAX_RECORDS:
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
