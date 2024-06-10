from domain.queries.service import QueriesScheduleService
from domain.queries.models import QueriesSchedule
from airflow.decorators import task, dag
import pendulum
import logging
from datetime import datetime
import os

from utils.utils import calculate_schedule
from utils.alerts import send_failure_alert_to_slack

WIOM_QC_ALERTS_URL = os.getenv("WIOM_QC_ALERTS_SLACK_URL")
queries_schedules_service = QueriesScheduleService()


@task
def get_queries_comparison(queries_schedule: QueriesSchedule):
    logging.info("Getting queries comparison results...")
    results = queries_schedules_service.get_queries_comparison(
        query_ids=queries_schedule.query_ids,
        key_columns=queries_schedule.key_columns,
        compare_columns=queries_schedule.compare_columns,
    )
    return results


@task
def create_table_and_save_image_to_s3(results, queries_schedule_id: str):
    image_url = queries_schedules_service.create_table_and_save_image_to_s3(
        results, queries_schedule_id
    )
    return image_url


@task
def create_payload(image_url, alert_name):
    payload = queries_schedules_service.create_payload(image_url,alert_name)
    return payload


@task
def dispatch_alert(slack_url, payload):
    queries_schedules_service.dispatch_alert(slack_url=slack_url, payload=payload)


def create_dag(schedule: QueriesSchedule, created_date: datetime):

    logging.info(f"Creating DAG")

    @dag(
        dag_id=f"queries_count_alert_{schedule.id}",
        description=f"Queries Compare Alert for schedule_id: {schedule.id}",
        schedule=(
            "0 8 * * *"
            if not schedule.schedule
            else calculate_schedule(schedule=schedule.schedule)
        ),
        start_date=pendulum.instance(
            created_date,
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        catchup=False,
        tags=[f"queries_compare-{schedule.id}"],
        default_args={
            "on_failure_callback": [send_failure_alert_to_slack],
        },
        is_paused_upon_creation=True,
    )
    def compute_queries_compare_alert():
        results = get_queries_comparison(schedule)
        url = create_table_and_save_image_to_s3(results, schedule.id)
        payload = create_payload(url,schedule.channel.alert_name)
        slack_url = schedule.channel.slack_url
        if slack_url == "string":
            slack_url = WIOM_QC_ALERTS_URL
        dispatch_alert(
            slack_url=slack_url,
            payload=payload,
        )

    return compute_queries_compare_alert()


queries_schedules = queries_schedules_service.get_queries_schedules()

for queries_schedule in queries_schedules:
    create_dag(
        schedule=queries_schedule,
        created_date=queries_schedule.created_at,
    )
