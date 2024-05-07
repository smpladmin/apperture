import logging
import os
import pendulum
from utils.utils import DAG_RETRIES, DAG_RETRY_DELAY
from utils.alerts import send_failure_alert_to_slack

from airflow.models import Variable

from datetime import timedelta, datetime
import clickhouse_connect
from airflow.decorators import task, dag
from dotenv import load_dotenv

load_dotenv(override=False)


@task
def store_backup(current_date, current_hour):
    backup_folder = os.getenv("CLICKSTREAM_BACKUP_FOLDER")
    s3_url = "https://apperture-clickhouse-backup.s3.ap-south-1.amazonaws.com"

    logging.info(
        f"Creating clickstream backup at {current_date}:{current_hour}HH, storing at {backup_folder}"
    )
    s3_path = f"{s3_url}/{backup_folder}/{current_date}/{current_hour}/"
    key_id = os.getenv("S3_ACCESS_KEY_ID")
    secret_key = os.getenv("S3_SECRET_ACCESS_KEY")

    table = "clickstream"
    client = clickhouse_connect.get_client(host="clickhouse")
    with client:
        query = f"BACKUP TABLE {table} TO S3('{s3_path}', '{key_id}', '{secret_key}') SETTINGS base_backup = S3('{s3_url}/backup', '{key_id}','{secret_key}')"
        logging.info(f"Starting to store backup:: {query}")
        client.command(query)
        logging.info("Backup stored successfully")


clickstream_backup_task_retries = int(
    Variable.get("clickstream_backup_task_retries", default_var=DAG_RETRIES)
)
clickstream_backup_task_retry_delay = int(
    Variable.get("clickstream_backup_task_retry_delay", default_var=DAG_RETRY_DELAY)
)


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
    default_args={
        "retries": clickstream_backup_task_retries,
        "retry_delay": timedelta(minutes=clickstream_backup_task_retry_delay),
        "on_failure_callback": [send_failure_alert_to_slack],
    },
)
def create_backup():
    date = datetime.now(tz=pendulum.timezone("Asia/Kolkata"))
    current_date = date.strftime("%Y-%m-%d")
    current_hour = date.hour
    store_backup(current_date, current_hour)


create_backup()
