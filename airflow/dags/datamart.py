import logging
import pendulum
from typing import Dict, Union
from datetime import datetime
from utils.utils import DATAMART_INIT_DATE
from airflow.decorators import dag, task, task_group


from domain.datamart.models import Datamart, TimeUnit
from domain.datasource.service import DataSourceService
from domain.datamart.service import DatamartService
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
datamart_service = DatamartService()


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
    datasource: DataSource, credential: Credential, database_client: DatabaseClient
) -> Union[MySQLCredential, MsSQLCredential, ClickHouseCredential]:
    if database_client != DatabaseClient.CLICKHOUSE:
        provider = datasource.provider
        if provider in [IntegrationProvider.MYSQL, IntegrationProvider.MSSQL]:
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
def push_datamart_to_google_sheet(datamart: Datamart):
    datamart_service.push_datamart_to_google_sheet(datamart_id=datamart.id)


@task(trigger_rule="all_done")
def refresh_datamart_table(
    datamart: Datamart,
    database_client: DatabaseClient,
    database_credential: Union[MySQLCredential, MsSQLCredential, ClickHouseCredential],
):
    logging.info("Refreshing datamart table")
    datamart_service.refresh_datamart(
        datamart_id=datamart.id,
        app_id=datamart.app_id,
        database_client=database_client,
        database_credential=database_credential,
    )


@task_group
def refresh_datamart(
    datamart: Datamart,
    database_client: DatabaseClient,
    database_credential: Union[MySQLCredential, MsSQLCredential, ClickHouseCredential],
):
    if datamart.google_sheet and datamart.google_sheet.enable_sheet_push:
        push_datamart_to_google_sheet(datamart=datamart)

    refresh_datamart_table(
        datamart=datamart,
        database_client=database_client,
        database_credential=database_credential,
    )


def calculate_schedule(datamart: Datamart) -> str:
    if not datamart.update_frequency:
        return "0 8 * * *"

    interval = datamart.update_frequency.interval
    unit = datamart.update_frequency.unit
    schedule = ""

    if unit == TimeUnit.MINUTES:
        schedule = f"*/{interval} * * * *"
    elif unit == TimeUnit.HOURS:
        schedule = f"0 */{interval} * * *"
    elif unit == TimeUnit.DAYS:
        schedule = f"0 0 */{interval} * *"

    return schedule


def create_dag(datamart: Datamart, datasource_id: str, created_date: datetime):
    @dag(
        dag_id=f"datamart_data_loader_{datamart.table_name}_{datamart.id}",
        description=f"Datamart datasource daily refresh for {datamart.table_name}_{datamart.id}",
        schedule=calculate_schedule(datamart=datamart),
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
            database_client=database_client,
        )

        refresh_datamart(
            datamart=datamart,
            database_client=database_client,
            database_credential=database_credentials,
        )

    datamart_loader()


datamarts = datamart_service.get_datamarts()

for datamart in datamarts:
    create_dag(
        datamart=datamart,
        datasource_id=datamart.datasource_id,
        created_date=datamart.created_at,
    )
