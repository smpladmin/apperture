import logging
import os
import pendulum

from utils.utils import DAG_RETRIES, DAG_RETRY_DELAY

from airflow.models import Variable
from datetime import timedelta, datetime
import boto3
from airflow.decorators import task, dag
from dotenv import load_dotenv

load_dotenv(override=False)


@task
def delete_backup(current_date):
    backup_folder = os.getenv("CLICKSTREAM_BACKUP_FOLDER")

    logging.info(f"DELETING clickstream backup at {current_date}, from {backup_folder}")
    key_id = os.getenv("S3_ACCESS_KEY_ID")
    secret_key = os.getenv("S3_SECRET_ACCESS_KEY")
    bucket_name = "apperture-clickhouse-backup"

    s3 = boto3.client("s3", aws_access_key_id=key_id, aws_secret_access_key=secret_key)
    continuation_token = None
    while True:
        response = (
            s3.list_objects_v2(
                Bucket=bucket_name,
                Prefix=backup_folder + f"/{current_date}",
                ContinuationToken=continuation_token,
            )
            if continuation_token
            else s3.list_objects_v2(
                Bucket=bucket_name, Prefix=backup_folder + f"/{current_date}"
            )
        )
        objects_to_delete = []
        for obj in response["Contents"]:
            objects_to_delete.append({"Key": obj["Key"]})
        if objects_to_delete:
            s3.delete_objects(Bucket=bucket_name, Delete={"Objects": objects_to_delete})
        print(
            f"Deleted {len(objects_to_delete)} objects from {bucket_name}/{backup_folder}/{current_date}"
        )
        if response["IsTruncated"]:
            continuation_token = response["NextContinuationToken"]
        else:
            break


clickstream_backup_deletion_task_retries = int(
    Variable.get("clickstream_backup_deletion_task_retries", default_var=DAG_RETRIES)
)
clickstream_backup_deletion_task_retry_delay = int(
    Variable.get(
        "clickstream_backup_deletion_task_retry_delay",
        default_var=DAG_RETRY_DELAY,
    )
)


@dag(
    dag_id=f"clickstream-delete-backup",
    description=f"Daily deletion of stale backup of clickstream data",
    schedule="0 12 * * *",
    start_date=pendulum.instance(
        datetime.now(),
        tz=pendulum.timezone("Asia/Kolkata"),
    ),
    catchup=False,
    tags=[f"clickstream-backup-deletion"],
    default_args={
        "retries": clickstream_backup_deletion_task_retries,
        "retry_delay": timedelta(minutes=clickstream_backup_deletion_task_retry_delay),
    },
)
def generate_dag():
    date = datetime.now(tz=pendulum.timezone("Asia/Kolkata")) - timedelta(days=3)
    current_date = date.strftime("%Y-%m-%d")
    delete_backup(current_date)


generate_dag()
