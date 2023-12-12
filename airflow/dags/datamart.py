import logging
import pendulum
from typing import Dict, Optional, Union
from datetime import datetime
from utils.utils import DATAMART_INIT_DATE
from airflow.decorators import dag, task, task_group


from domain.datamart.models import (
    DatamartActions,
    ActionType,
    HourlySchedule,
    DailySchedule,
    WeeklySchedule,
    Frequency,
    MonthlySchedule,
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
def push_datamart_to_google_sheet(datamart_action: DatamartActions):
    datamart_action_service.push_datamart_to_target(
        datamart_id=datamart_action.datamart_id,
        type=datamart_action.type,
        meta=datamart_action.meta,
    )


@task(trigger_rule="all_done")
def push_datamart_to_api(datamart_action: DatamartActions):
    datamart_action_service.push_datamart_to_target(
        datamart_id=datamart_action.datamart_id,
        type=datamart_action.type,
        meta=datamart_action.meta,
    )


@task(trigger_rule="all_done")
def refresh_datamart_table(
    datamart_actions: DatamartActions,
    database_client: DatabaseClient,
    database_credential: Union[MySQLCredential, MsSQLCredential, ClickHouseCredential],
):
    logging.info("Refreshing datamart table")
    datamart_action_service.refresh_datamart(
        datamart_id=datamart_actions.id,
        app_id=datamart_actions.app_id,
        database_client=database_client,
        database_credential=database_credential,
    )


@task_group
def refresh_datamart(
    datamart_action: DatamartActions,
    database_client: DatabaseClient,
    database_credential: Union[MySQLCredential, MsSQLCredential, ClickHouseCredential],
):
    if datamart_action.type == ActionType.GOOGLE_SHEET:
        push_datamart_to_google_sheet(datamart_action=datamart_action)

    if datamart_action.type == ActionType.API:
        push_datamart_to_api(datamart_action=datamart_action)

    if datamart_action.type == ActionType.TABLE:
        refresh_datamart_table(
            datamart_actions=datamart_action,
            database_client=database_client,
            database_credential=database_credential,
        )


def get_daily_schedule_cron_expression(
    time_str: str, period: str, day: Optional[str], date: Optional[str]
):
    time_obj = datetime.strptime(time_str + " " + period, "%I:%M %p")
    hour_24 = time_obj.strftime("%H")
    minute = time_obj.strftime("%M")

    if day:
        days_of_week = {
            "Monday": 1,
            "Tuesday": 2,
            "Wednesday": 3,
            "Thursday": 4,
            "Friday": 5,
            "Saturday": 6,
            "Sunday": 0,
        }

        cron_day = days_of_week[day]
        return f"{minute} {hour_24} * * {cron_day}"

    if date:
        day = date.split("-")[0]
        return f"{minute} {hour_24} {day} * *"

    return f"{minute} {hour_24} * * *"


def calculate_schedule(
    schedule: Union[WeeklySchedule, MonthlySchedule, DailySchedule, HourlySchedule]
) -> str:
    if schedule.frequency == Frequency.HOURLY:
        return "0 * * * *"

    if schedule.frequency == Frequency.DAILY:
        return get_daily_schedule_cron_expression(
            time_str=schedule.time, period=schedule.period, day=None, date=None
        )

    if schedule.frequency == Frequency.WEEKLY:
        return get_daily_schedule_cron_expression(
            time_str=schedule.time, period=schedule.period, day=schedule.day, date=None
        )

    if schedule.frequency == Frequency.MONTHLY:
        return get_daily_schedule_cron_expression(
            time_str=schedule.time, period=schedule.period, day=None, date=schedule.date
        )

    return "0 8 * * *"


def create_dag(
    datamart_action: DatamartActions, datasource_id: str, created_date: datetime
):
    @dag(
        dag_id=f"datamart_action_loader_{datamart_action.type}_{datamart_action.id}",
        description=f"Datamart datasource daily refresh for {datamart_action.type}_{datamart_action.id}",
        schedule=calculate_schedule(schedule=datamart_action.schedule),
        start_date=pendulum.instance(
            created_date if created_date > DATAMART_INIT_DATE else DATAMART_INIT_DATE,
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        tags=["datamart-scheduled-data-fetch"],
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

        refresh_datamart(
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
