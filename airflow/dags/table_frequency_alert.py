import logging

import pytz

from domain.alerts.service import AlertsService
from domain.alerts.models import (
    AlertType,
    CdcCredential,
    Alert,
    ThresholdType,
)
import pendulum

from typing import Dict
from datetime import datetime
from airflow.decorators import task, dag

from utils.utils import calculate_schedule
from domain.datasource.models import (
    IntegrationProvider,
)


alerts_service = AlertsService()
provider = IntegrationProvider.CLEVERTAP


@task
def get_cdc_cred(
    datasource_id: str,
) -> Dict:
    cdc_cred = alerts_service.get_cdc_cred(datasource_id=datasource_id)
    logging.info(f"Cred: {cdc_cred}")
    return {
        "source_db_cred": cdc_cred.cdcCredential,
        "remote_connection": cdc_cred.remoteConnection,
        "ch_cred": cdc_cred.clickhouseCredential,
        "app_id": cdc_cred.appId,
    }


@task
def get_source_table_row_frequency(
    source_db_cred: CdcCredential,
    table: str,
    last_n_minutes: int,
    timestamp_column: str,
):
    return alerts_service.get_row_frequency_for_source_table(
        cdc_cred=source_db_cred,
        table=table,
        last_n_minutes=last_n_minutes,
        timestamp_column=timestamp_column,
    )


@task
def create_alert_message(count, table, last_n_minutes):
    message = f"Count for table {table} in last {last_n_minutes} minutes: {count[0][0]}"
    payload = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"Alert - CDC DB Count:zap:",
                "emoji": True,
            },
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": message,
            },
        },
    ]
    return payload


@task
def dispatch_alert(slack_url, payload, count):
    in_sleep = False
    sleep_start, sleep_end = (
        alert.frequencyAlert.sleep_hours_start,
        alert.frequencyAlert.sleep_hours_end,
    )
    if sleep_start and sleep_end:
        indian_timezone = pytz.timezone("Asia/Kolkata")
        current_hour = datetime.now(tz=indian_timezone).hour
        if (current_hour >= sleep_start) and (current_hour < sleep_end):
            in_sleep = True
    if (
        alert.threshold.type == ThresholdType.ABSOLUTE
        and (count[0][0] > alert.threshold.value)
        and (not in_sleep)
    ):
        alerts_service.dispatch_alert(slack_url=slack_url, payload=payload)


def create_dag(datasource_id: str, alert: Alert, created_date: datetime):
    @dag(
        dag_id=f"TABLE_FREQUENCY_ALERT_{alert.id}_{datasource_id}",
        description=f"Table Frequency Alert: {datasource_id}",
        schedule="0 8 * * *"
        if not alert.schedule
        else calculate_schedule(schedule=alert.schedule),
        start_date=pendulum.instance(
            created_date,
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        catchup=False,
        tags=[f"alert-{datasource_id}"],
    )
    def compute_cdc_db_count_alert():
        # Step 1: Get CDC credential for the datasource on which alert is setup
        creds = get_cdc_cred(datasource_id=datasource_id)

        # Step 2: Get source table frequency
        count = get_source_table_row_frequency(
            source_db_cred=creds["source_db_cred"],
            table=alert.table,
            last_n_minutes=alert.frequencyAlert.last_n_minutes,
            timestamp_column=alert.frequencyAlert.timestamp_column,
        )

        # Step 3: Create payload
        alert_message = create_alert_message(
            count=count,
            table=alert.table,
            last_n_minutes=alert.frequencyAlert.last_n_minutes,
        )

        # Step 4: Dispatch Alert
        dispatch_alert(
            payload=alert_message, slack_url=alert.channel.slack_url, count=count
        )

    compute_cdc_db_count_alert()


alerts = alerts_service.get_alerts()

for alert in alerts:
    if alert.type == AlertType.TABLE_FREQUENCY:
        create_dag(
            alert=alert,
            created_date=alert.createdAt,
            datasource_id=alert.datasourceId,
        )
