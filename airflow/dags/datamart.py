import logging
import pendulum
from typing import Dict, Union, List
from datetime import datetime, timedelta
from utils.utils import (
    DAG_RETRIES,
    DAG_RETRY_DELAY,
    FREQUENCY_DELTAS,
    calculate_schedule,
    calculate_schedule_datamart,
)
from utils.alerts import send_failure_alert_to_slack
from airflow.decorators import dag, task, task_group
from airflow.models import Variable


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


def calculate_start_date(created_date: datetime, schedule: Schedule) -> datetime:
    delta = FREQUENCY_DELTAS.get(schedule.frequency, timedelta(days=1))
    return created_date - delta


def get_datamart_action_dag_id(datamart_action: DatamartAction):
    type = datamart_action.type
    meta = datamart_action.meta
    action_id = datamart_action.id

    dag_id = f"datamart_{datamart_action.datamart_id}_action_loader_"

    if type == ActionType.GOOGLE_SHEET:
        sheet_name = meta.spreadsheet.name
        name = sheet_name.replace(" ", "_")
        return dag_id + f"{type}_{name}_{action_id}"

    if type == ActionType.TABLE:
        table = meta.name
        return dag_id + f"{type}_{table}_{action_id}"

    return dag_id + f"{type}_{action_id}"


@task_group
def datamart_refresh_group(datasource_id, datamart_action):
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


def create_dag(datamart_actions: List[DatamartAction]):
    # Extract vars
    datamart_action = datamart_actions[0]
    datasource_id = datamart_action.datasource_id
    created_date = datamart_action.created_at

    datamart_action_task_retries = int(
        Variable.get("datamart_action_task_retries", default_var=DAG_RETRIES)
    )
    datamart_action_task_retry_delay = int(
        Variable.get("datamart_action_task_retry_delay", default_var=DAG_RETRY_DELAY)
    )

    @dag(
        dag_id=get_datamart_action_dag_id(datamart_action=datamart_action),
        description=f"Datamart datasource daily refresh for {datamart_action.type}_{datamart_action.id}",
        schedule=calculate_schedule_datamart(schedule=datamart_action.schedule),
        start_date=pendulum.instance(
            calculate_start_date(
                created_date=created_date, schedule=datamart_action.schedule
            ),
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        tags=["datamart-scheduled-data-fetch"],
        catchup=False,
        is_paused_upon_creation=False,
        default_args={
            "retries": datamart_action_task_retries,
            "retry_delay": timedelta(minutes=datamart_action_task_retry_delay),
            "on_failure_callback": [send_failure_alert_to_slack],
        },
    )
    def datamart_loader():
        previous_task = None
        for datamart_action in datamart_actions:
            current_task = datamart_refresh_group(datasource_id, datamart_action)
            # Adding dependent datamarts in same dag as a supsequent taskgroup
            if previous_task:
                previous_task >> current_task
            previous_task = current_task

    datamart_loader()


datamart_actions = datamart_action_service.get_datamart_actions()
logging.info(f"DATAMART_LOG: Fetched datamart_actions: {datamart_actions}")
print(f"DATAMART_LOG: Fetched datamart_actions: {datamart_actions}")

# Fetching dependent datamarts
datamart_actions_filtered = []
dependent_dags_map = {}
for index, datamart_action in enumerate(datamart_actions):
    if datamart_action.schedule.frequency == Frequency.DATAMART:
        key = datamart_action.datasource_id + "$$" + datamart_action.schedule.datamartId
        if key in dependent_dags_map:
            dependent_dags_map[key].append(datamart_action)
        else:
            dependent_dags_map[key] = [datamart_action]
    else:
        datamart_actions_filtered.append(datamart_action)


for datamart_action in datamart_actions_filtered:
    dependent_dags = []
    # Adding dependent datamarts in same dag as a supsequent taskgroup
    if datamart_action.type == ActionType.TABLE:
        dependent_dags = dependent_dags_map.get(
            datamart_action.datasource_id + "$$" + datamart_action.datamart_id, []
        )
    create_dag([datamart_action] + dependent_dags)
