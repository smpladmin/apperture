from datetime import datetime
import logging
from store.branch_saver import BranchDataSaver
from event_processors.branch_event_processor import BranchEventProcessor
from fetch.branch_data_fetcher import BranchDataFetcher
from store.clickhouse_client_factory import ClickHouseClientFactory
import pendulum

from airflow.models import Param
from typing import Dict, Union, List
from datetime import timedelta, datetime
from airflow.decorators import task, dag

from store.events_saver import EventsSaver
from domain.datasource.service import DataSourceService

from utils.utils import (
    BRANCH_DATA_FETCH_DAYS_OFFSET,
    AIRFLOW_INIT_DATE,
)
from event_processors.clevertap_event_processor import ClevertapEventProcessor
from domain.datasource.models import (
    AppDatabaseResponse,
    BranchCredential,
    IntegrationProvider,
    Credential,
    DataSource,
    ClickHouseRemoteConnectionCred,
)


datasource_service = DataSourceService()
provider = IntegrationProvider.BRANCH


@task
def get_datasource_and_credential(
    datasource_id: str,
) -> Dict[str, Union[DataSource, Credential]]:
    datasource = datasource_service.get_datasource_with_credential(id=datasource_id)
    logging.info(f"Datasource Credential retrieved")
    return {"datasource": datasource.datasource, "credential": datasource.credential}


@task
def get_clickhouse_server_credential(
    datasource: DataSource,
) -> Union[ClickHouseRemoteConnectionCred, None]:
    return datasource_service.get_clickhouse_server_credentials_for_app(
        app_id=datasource.appId
    )


@task
def process_branch_event_files(events_data):
    return BranchEventProcessor().process(events_data=events_data)


@task
def create_branch_fetcher(credential: Credential, **kwargs):
    date = (
        kwargs["params"]["run_date"]
        if kwargs["params"]["run_date"]
        else kwargs["logical_date"].format("YYYY-MM-DD")
    )
    logging.info(f"RUNNING FOR DATE {date}")
    return BranchDataFetcher(credential=credential.branch_credential, date=date)


@task
def get_event_links(fetcher: BranchDataFetcher):
    return fetcher.get_branch_details()


@task
def get_tables(event_list):
    return list(event_list.keys())


@task
def process_and_save_events(
    event_links,
    fetcher: BranchDataFetcher,
    database_details: AppDatabaseResponse,
    clickhouse_server_credentials: Union[ClickHouseRemoteConnectionCred, None],
):
    saver = BranchDataSaver(
        app_id=datasource.appId,
        clickhouse_server_credentials=clickhouse_server_credentials,
    )
    for table, paths in event_links.items():
        for path in paths:
            events_data = fetcher.open(path)
            clean_data = BranchEventProcessor().process(events_data=events_data)
            saver.save(
                table_name=table,
                database_name=database_details.database_credentials.databasename,
                event_data=clean_data,
            )


@task
def save_branch_details(
    app_id: str,
    database_name: str,
    table_name: str,
    event_data,
    clickhouse_server_credentials: Union[ClickHouseRemoteConnectionCred, None],
):
    saver = BranchDataSaver(
        app_id=app_id, clickhouse_server_credentials=clickhouse_server_credentials
    )
    saver.save(
        table_name=table_name, database_name=database_name, event_data=event_data
    )


@task
def get_app_database(
    datasource: DataSource,
) -> AppDatabaseResponse:
    return datasource_service.get_database_for_app(app_id=datasource.appId)


def create_dag(datasource_id: str, created_date: datetime):
    @dag(
        dag_id=f"branch_data_loader_{datasource_id}",
        description=f"Branch daily refresh for {datasource_id}",
        schedule="0 8 * * *",
        start_date=pendulum.instance(
            created_date - timedelta(days=BRANCH_DATA_FETCH_DAYS_OFFSET),
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        params={
            "run_date": Param(
                "",
                type=["string", "null"],
                format="datetime",
                title="run_date",
                description="Select run date (Leave empty to fetch data for the day prior to the logical date)",
            ),
        },
        catchup=(created_date > AIRFLOW_INIT_DATE),
        tags=[f"branch-daily-data-fetch"],
    )
    def branch_data_sync():
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        datasource = datasource_with_credential["datasource"]
        credential = datasource_with_credential["credential"]
        clickhouse_server_credential = get_clickhouse_server_credential(
            datasource=datasource
        )
        app_database_details = get_app_database(datasource=datasource)
        fetcher = create_branch_fetcher(credential=credential)
        event_links = get_event_links(fetcher=fetcher)
        process_and_save_events(
            event_links=event_links,
            fetcher=fetcher,
            database_details=app_database_details,
            clickhouse_server_credentials=clickhouse_server_credential,
        )

    branch_data_sync()


datasources = datasource_service.get_datasources_for_provider(provider=provider)

for datasource in datasources:
    create_dag(datasource_id=datasource.id, created_date=datasource.createdAt)
