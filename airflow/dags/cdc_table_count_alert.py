import logging

from domain.alerts.service import AlertsService
from domain.alerts.models import AlertType, CdcCredential, ClickHouseCredential, Alert
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
def get_source_db_count(source_db_cred: CdcCredential, table: str):
    return alerts_service.get_row_counts_for_source_table(
        cdc_cred=source_db_cred, table=table
    )


@task
def get_ch_db_count(
    app_id: str,
    ch_cred: ClickHouseCredential,
    clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
    table: str,
):
    return alerts_service.get_row_counts_for_ch_table(
        app_id=app_id,
        ch_cred=ch_cred,
        clickhouse_server_credential=clickhouse_server_credential,
        table=table,
    )


@task
def create_alert_message(source_db_count, ch_db_count, table):
    message = "Table \t Source DB \t Clickhouse \n"
    message += f"{table}: {source_db_count[0][0]} \t {ch_db_count[0][0]} \n"

    payload = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"Alert - CDC Table Count {table}:zap:",
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
        dag_id=f"CDC_TABLE_COUNT_ALERT_{alert.id}_{datasource_id}",
        description=f"CDC table count alert for datasource_id: {datasource_id}",
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
        creds = get_cdc_cred(datasource_id=datasource_id)

        source_db_count = get_source_db_count(
            source_db_cred=creds["source_db_cred"], table=alert.table
        )

        ch_db_count = get_ch_db_count(
            app_id=creds["app_id"],
            ch_cred=creds["ch_cred"],
            clickhouse_server_credential=creds["remote_connection"],
            table=alert.table,
        )

        alert_message = create_alert_message(
            source_db_count=source_db_count, ch_db_count=ch_db_count, table=alert.table
        )

        dispatch_alert(
            payload=alert_message,
            slack_url=alert.channel.slack_url,
        )

    compute_cdc_db_count_alert()


alerts = alerts_service.get_alerts()

for alert in alerts:
    if alert.type == AlertType.CDC_TABLE_COUNT:
        create_dag(
            alert=alert,
            created_date=alert.createdAt,
            datasource_id=alert.datasourceId,
        )
