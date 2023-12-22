import logging
import os
import pendulum

from airflow.models import Param

from datetime import timedelta, datetime
import clickhouse_connect
from airflow.decorators import task, dag
from dotenv import load_dotenv

load_dotenv(override=False)


@task
def store_backup(current_date, current_hour):
    backup_folder = "inc_prod_backup"
    s3_url = "https://apperture-clickhouse-backup.s3.ap-south-1.amazonaws.com"

    logging.info(
        f"Creating clickstream backup at {current_date}:{current_hour}HH, storing at {backup_folder}"
    )
    s3_path = f"{s3_url}/{backup_folder}/{current_date}/{current_hour}/"
    key_id = "AKIATCYOZQRYMITBDHSX"
    secret_key = "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"

    table = "clickstream"
    client = clickhouse_connect.get_client(host="clickhouse")
    with client:
        query = f"BACKUP TABLE {table} TO S3('{s3_path}', '{key_id}', '{secret_key}') SETTINGS base_backup = S3('{s3_url}/backup', '{key_id}','{secret_key}')"
        logging.info(f"Starting to store backup")
        client.command(query)
        logging.info("Backup stored successfully")


@dag(
    dag_id=f"clickstream-data-backup",
    description=f"Hourly backup of clickstream data",
    schedule="0 * * * *",
    start_date=pendulum.instance(
        datetime.now(),
        tz=pendulum.timezone("Asia/Kolkata"),
    ),
    catchup=False,
    tags=[f"clickstream-hourly-backup"],
)
def create_backup():
    date = datetime.now(tz=pendulum.timezone("Asia/Kolkata"))
    current_date = date.strftime("%Y-%m-%d")
    current_hour = date.hour
    store_backup(current_date, current_hour)


create_backup()
