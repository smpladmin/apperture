import logging
import pendulum
from typing import Dict, Union
from datetime import datetime, timedelta
from utils.utils import (
    DAG_RETRIES,
    DAG_RETRY_DELAY,
    get_cron_expression,
    FREQUENCY_DELTAS,
)
from airflow.decorators import dag, task, task_group


from domain.datamart.models import (
    DatamartAction,
    ActionType,
    Schedule,
    Frequency,
)
from domain.datasource.service import DataSourceService
from domain.datamart.service import DatamartActionsService
from domain.datasource.models import (
    ClickHouseCredential,
    DatabaseClient,
    IntegrationProvider,
    Credential,
    DataSource,
    MsSQLCredential,
    MySQLCredential,
)


datasource_service = DataSourceService()
datamart_action_service = DatamartActionsService()


@task
def get_datasource_and_credential(
    datasource_id: str,
) -> Dict[str, Union[DataSource, Credential]]:
    datasource = datasource_service.get_datasource_with_credential(id=datasource_id)
    return {"datasource": datasource.datasource, "credential": datasource.credential}


@task
def get_database_client(datasource: DataSource) -> DatabaseClient:
    provider = datasource.provider
    if provider == IntegrationProvider.MYSQL:
        return DatabaseClient.MYSQL
    elif provider == IntegrationProvider.MSSQL:
        return DatabaseClient.MSSQL
    else:
        return DatabaseClient.CLICKHOUSE


@task
def get_database_credentials(
    datasource: DataSource, credential: Credential
) -> Union[MySQLCredential, MsSQLCredential, ClickHouseCredential]:
    provider = datasource.provider
    if provider == IntegrationProvider.MYSQL:
        return credential.mysql_credential
    elif provider == IntegrationProvider.MSSQL:
        return credential.mssql_credential
    else:
        database_details = datasource_service.get_database_for_app(
            app_id=datasource.appId
        )
        return database_details.database_credentials


@task(trigger_rule="all_done")
def push_datamart_to_google_sheet(datamart_action: DatamartAction):
    logging.info(f"Pushing data to google sheet: {datamart_action.meta}")
    datamart_action_service.push_datamart_to_target(
        datamart_id=datamart_action.datamart_id,
        type=datamart_action.type,
        meta=datamart_action.meta,
    )


@task(trigger_rule="all_done")
def push_datamart_to_api(datamart_action: DatamartAction):
    logging.info(f"Pushing data to API: {datamart_action.meta}")
    datamart_action_service.push_datamart_to_target(
        datamart_id=datamart_action.datamart_id,
        type=datamart_action.type,
        meta=datamart_action.meta,
    )


@task(trigger_rule="all_done")
def refresh_table_action(
    datamart_action: DatamartAction,
    database_client: DatabaseClient,
    database_credential: Union[MySQLCredential, MsSQLCredential, ClickHouseCredential],
):
    logging.info(f"Refreshing datamart action table: {datamart_action.meta}")
    datamart_action_service.refresh_table_action(
        datamart_id=datamart_action.datamart_id,
        app_id=datamart_action.app_id,
        database_client=database_client,
        database_credential=database_credential,
        table_name=datamart_action.meta.name,
    )


@task_group
def refresh_datamart_action(
    datamart_action: DatamartAction,
    database_client: DatabaseClient,
    database_credential: Union[MySQLCredential, MsSQLCredential, ClickHouseCredential],
):
    if datamart_action.type == ActionType.GOOGLE_SHEET:
        push_datamart_to_google_sheet(datamart_action=datamart_action)

    if datamart_action.type == ActionType.API:
        push_datamart_to_api(datamart_action=datamart_action)

    if datamart_action.type == ActionType.TABLE:
        refresh_table_action(
            datamart_action=datamart_action,
            database_client=database_client,
            database_credential=database_credential,
        )


def calculate_schedule(schedule: Schedule) -> str:
    if schedule.frequency == Frequency.HOURLY:
        return "0 * * * *"

    return get_cron_expression(
        time_str=schedule.time,
        period=schedule.period,
        day=schedule.day if schedule.frequency == Frequency.WEEKLY else None,
        date=schedule.date if schedule.frequency == Frequency.MONTHLY else None,
    )


def calculate_start_date(created_date: datetime, schedule: Schedule) -> datetime:
    delta = FREQUENCY_DELTAS.get(schedule.frequency, timedelta(days=1))
    return created_date - delta


def create_dag(
    datamart_action: DatamartAction, datasource_id: str, created_date: datetime
):
    @dag(
        dag_id=f"datamart_action_loader_{datamart_action.type}_{datamart_action.id}",
        description=f"Datamart datasource daily refresh for {datamart_action.type}_{datamart_action.id}",
        schedule=calculate_schedule(schedule=datamart_action.schedule),
        start_date=pendulum.instance(
            calculate_start_date(
                created_date=created_date, schedule=datamart_action.schedule
            ),
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        tags=["datamart-scheduled-data-fetch"],
        catchup=False,
        default_args={
            "retries": DAG_RETRIES,
            "retry_delay": timedelta(minutes=DAG_RETRY_DELAY),
        },
    )
    def datamart_loader():
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        datasource = datasource_with_credential["datasource"]
        credential = datasource_with_credential["credential"]
        database_client = get_database_client(datasource=datasource)
        database_credentials = get_database_credentials(
            datasource=datasource,
            credential=credential,
        )

        refresh_datamart_action(
            datamart_action=datamart_action,
            database_client=database_client,
            database_credential=database_credentials,
        )

    datamart_loader()


datamart_actions = datamart_action_service.get_datamart_actions()

for datamart_action in datamart_actions:
    create_dag(
        datamart_action=datamart_action,
        datasource_id=datamart_action.datasource_id,
        created_date=datamart_action.created_at,
    )
