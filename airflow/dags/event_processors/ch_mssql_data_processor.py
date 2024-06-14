import pandas as pd
import json
import ast
from fetch.ch_mssql_data_fetcher import MSSQLClient, ClickHouseClient
from datetime import datetime
import logging
import os
from dotenv import load_dotenv


def convert_object_keys_to_list_of_list(data: dict, keys: list):
    for key in data.keys():
        if key in keys:
            value = data[key]
            if isinstance(value, list):
                continue
            try:
                result = json.loads(value)
                data[key] = [result]
            except (ValueError, json.JSONDecodeError):
                try:
                    result = ast.literal_eval(value)
                    data[key] = [result]
                except (ValueError, SyntaxError):
                    pass
    return data


def process_data():
    KEYS_TYPECAST_TO_LIST_OF_LIST = ["partners"]
    load_dotenv()
    mssql_server = os.getenv("MSSQL_SERVER")
    mssql_database = os.getenv("MSSQL_DATABASE")
    mssql_username = os.getenv("MSSQL_USERNAME")
    mssql_password = os.getenv("MSSQL_PASSWORD")

    ch_host = os.getenv("CH_HOST")
    ch_port = int(os.getenv("CH_PORT"))
    ch_username = os.getenv("CH_USERNAME")
    ch_password = os.getenv("CH_PASSWORD")
    ch_database = os.getenv("CH_DATABASE")

    mssql_client = MSSQLClient(
        mssql_server, mssql_database, mssql_username, mssql_password
    )
    ch_client = ClickHouseClient(
        ch_host, ch_port, ch_username, ch_password, ch_database
    )

    today = datetime.today()
    formatted_date = today.strftime("%d%b")
    final_result = "backfill_" + formatted_date

    mssql_query = f"""
    SELECT *
    FROM
    (
        SELECT 'booking_logs' AS table_, '65b1f642f3213a617bbedf8f' AS datasource_id, '{final_result}' AS source_flag,
               JSON_VALUE(data, '$.messageId') AS message_id, *
        FROM log_db.dbo.booking_logs
        WHERE CAST(added_time AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)
    ) a
    UNION ALL
    SELECT *
    FROM
    (
        SELECT 'task_logs' AS table_, '65b1f642f3213a617bbedf8' AS datasource_id, '{final_result}' AS source_flag,
               JSON_VALUE(data, '$.messageId') AS message_id, *
        FROM log_db.dbo.task_logs
        WHERE CAST(added_time AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)
    ) a
    UNION ALL
    SELECT *
    FROM
    (
        SELECT 'payment_logs' AS table_, '65b1f642f3213a617bbedf8' AS datasource_id, '{final_result}' AS source_flag,
               JSON_VALUE(data, '$.messageId') AS message_id, *
        FROM log_db.dbo.payment_logs
        WHERE CAST(added_time AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)
    ) a
    UNION ALL
    SELECT *
    FROM
    (
        SELECT 'customer_logs' AS table_, '65b1f642f3213a617bbedf8' AS datasource_id, '{final_result}' AS source_flag,
               JSON_VALUE(data, '$.messageId') AS message_id, *
        FROM log_db.dbo.customer_logs
        WHERE CAST(added_time AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)
    ) a
    UNION ALL
    SELECT *
    FROM
    (
        SELECT 'ginie_logs' AS table_, '65b1f642f3213a617bbedf8' AS datasource_id, '{final_result}' AS source_flag,
               JSON_VALUE(data, '$.messageId') AS message_id, *
        FROM log_db.dbo.ginie_logs
        WHERE CAST(added_time AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)
    ) a
    """

    df_mssql = mssql_client.query(mssql_query)
    if df_mssql is None:
        raise ValueError("MSSQL query returned None")
    df_mssql = df_mssql.fillna("")
    df_mssql = df_mssql.drop_duplicates()
    logging.info(f"MSSQL query returned {len(df_mssql)} rows")
    ch_query = """
    SELECT message_id AS message_id
    FROM
    (
        SELECT  data.messageId message_id,*
        FROM wiom_in.prod_events
        WHERE toDate(added_time) = toDate(now() - INTERVAL 1 DAY)
         and table in ('booking_logs','task_logs','ginie_logs','customer_logs','payment_logs','partner_logs')
    )
    group by 1
    """
    df_clickhouse = ch_client.query(ch_query)
    if df_clickhouse is None:
        raise ValueError("ClickHouse query returned None")
    df_clickhouse = df_clickhouse.drop_duplicates()
    logging.info(f"Clickhouse query returned {len(df_clickhouse)} rows")

    merged_df = df_mssql.merge(
        df_clickhouse[["message_id"]], on="message_id", how="left", indicator=True
    )
    merged_df = merged_df[merged_df["_merge"] != "both"]
    merged_df = merged_df.drop(columns=["message_id", "_merge", "id"])
    merged_df = merged_df.rename(columns={"event": "event_name", "table_": "table"})
    merged_df["task_id"] = (
        merged_df["task_id"]
        .replace("", 0)
        .replace("NaN", 0)
        .astype(float)
        .astype(object)
    )
    column_select = [
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
    final_df = merged_df[column_select]
    final_df = final_df.drop_duplicates()
    final_df["data"] = (
        final_df["data"]
        .apply(json.loads)
        .apply(
            lambda x: convert_object_keys_to_list_of_list(
                x, KEYS_TYPECAST_TO_LIST_OF_LIST
            )
        )
    )
    final_df["event_name"] = final_df["event_name"].astype("string")
    final_df["added_time"] = pd.to_datetime(final_df["added_time"], errors="coerce")
    final_df["table"] = final_df["table"].astype("string")
    final_df["mobile"] = final_df["mobile"].astype("string")
    final_df["task_id"] = final_df["task_id"].astype("string")
    final_df["account_id"] = final_df["account_id"].astype("string")
    final_df["key"] = final_df["key"].astype("string")
    final_df["datasource_id"] = final_df["datasource_id"].astype("string")
    final_df["source_flag"] = final_df["source_flag"].astype("string")
    logging.info(f"Data to be added :{final_df}")
    return final_df
