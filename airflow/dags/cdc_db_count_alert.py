import logging

from domain.alerts.service import AlertsService
from domain.alerts.models import (
    AlertType,
    CdcCredential,
    ClickHouseCredential,
    Alert,
    ThresholdType,
)
import pendulum

from typing import Dict, Union
from datetime import datetime
from airflow.decorators import task, dag

from utils.utils import calculate_schedule
from domain.datasource.models import (
    IntegrationProvider,
    ClickHouseRemoteConnectionCred,
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
def get_source_db_row_count(source_db_cred: CdcCredential):
    return alerts_service.get_row_counts_for_source_db(cdc_cred=source_db_cred)


@task
def get_source_db_column_count(source_db_cred: CdcCredential):
    return alerts_service.get_column_counts_for_source_db(cdc_cred=source_db_cred)


@task
def get_ch_db_row_count(
    app_id: str,
    ch_cred: ClickHouseCredential,
    clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
):
    return alerts_service.get_row_counts_for_ch_db(
        app_id=app_id,
        ch_cred=ch_cred,
        clickhouse_server_credential=clickhouse_server_credential,
    )


@task
def get_ch_db_column_count(
    app_id: str,
    ch_cred: ClickHouseCredential,
    clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
):
    return alerts_service.get_column_counts_for_ch_db(
        app_id=app_id,
        ch_cred=ch_cred,
        clickhouse_server_credential=clickhouse_server_credential,
    )


@task
def create_alert_message(
    source_db_row_count, ch_db_row_count, source_db_column_count, ch_db_column_count
):
    row_counts = [
        (table, count1, count2)
        for table, count1 in source_db_row_count
        for table2, count2 in ch_db_row_count
        if table == table2
    ]
    column_counts = [
        (table, count1, count2)
        for table, count1 in source_db_column_count
        for table2, count2 in ch_db_column_count
        if table == table2
    ]
    message = "ROW COUNT: \n Table \t Source DB \t Clickhouse \n"
    for table, count1, count2 in row_counts:
        threshold_crossed = False
        if alert.threshold.type == ThresholdType.ABSOLUTE:
            threshold_crossed = (count1 - count2) > alert.threshold.value
        elif alert.threshold.type == ThresholdType.PERCENTAGE:
            threshold_crossed = (count1 - count2) * 100 / count1 > alert.threshold.value
        if threshold_crossed:
            message += f"{table}: {count1}, {count2} \n"

    message += "\n COLUMN COUNT: \n Table \t Source DB \t Clickhouse \n"
    for table, count1, count2 in column_counts:

        # Clickhouse table has 2 additional columns: is_deleted and shard
        if count1 + 2 != count2:
            message += f"{table}: {count1}, {count2-2} \n"

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
def dispatch_alert(slack_url, payload):
    alerts_service.dispatch_alert(slack_url=slack_url, payload=payload)


def create_dag(datasource_id: str, alert: Alert, created_date: datetime):
    @dag(
        dag_id=f"CDC_DB_COUNT_ALERT_{alert.id}_{datasource_id}",
        description=f"CDC database count alert for datasource_id: {datasource_id}",
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

        # Step 2: Get Source DB count
        source_db_row_count = get_source_db_row_count(
            source_db_cred=creds["source_db_cred"]
        )
        source_db_column_count = get_source_db_column_count(
            source_db_cred=creds["source_db_cred"]
        )

        # Step 3: Get CH DB count
        ch_db_row_count = get_ch_db_row_count(
            app_id=creds["app_id"],
            ch_cred=creds["ch_cred"],
            clickhouse_server_credential=creds["remote_connection"],
        )
        ch_db_column_count = get_ch_db_column_count(
            app_id=creds["app_id"],
            ch_cred=creds["ch_cred"],
            clickhouse_server_credential=creds["remote_connection"],
        )
        # Step 4: Create payload
        alert_message = create_alert_message(
            source_db_row_count=source_db_row_count,
            ch_db_row_count=ch_db_row_count,
            source_db_column_count=source_db_column_count,
            ch_db_column_count=ch_db_column_count,
        )

        # Step 5: Dispatch Alert
        dispatch_alert(
            payload=alert_message,
            slack_url=alert.channel.slack_url,
        )

    compute_cdc_db_count_alert()


alerts = alerts_service.get_alerts()

for alert in alerts:
    if alert.type == AlertType.CDC_DB_COUNT:
        create_dag(
            alert=alert,
            created_date=alert.createdAt,
            datasource_id=alert.datasourceId,
        )
