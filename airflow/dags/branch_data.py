from datetime import datetime
import logging
from store.branch_saver import BranchDataSaver
from event_processors.branch_event_processor import (
    BranchEventProcessor,
    BranchSummaryEventProcessor,
)
from fetch.branch_data_fetcher import BranchDataFetcher, BranchSummaryDataFetcher
from store.clickhouse_client_factory import ClickHouseClientFactory
import pendulum

from airflow.models import Param, Variable
from typing import Dict, Union, List
from datetime import timedelta, datetime
from airflow.decorators import task, dag

from store.events_saver import EventsSaver
from domain.datasource.service import DataSourceService
from utils.alerts import send_failure_alert_to_slack

from utils.utils import (
    BRANCH_DATA_FETCH_DAYS_OFFSET,
    AIRFLOW_INIT_DATE,
    DAG_RETRIES,
    DAG_RETRY_DELAY,
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
def create_branch_summary_fetcher(credential: Credential, **kwargs):
    date = (
        kwargs["params"]["run_date"]
        if kwargs["params"]["run_date"]
        else kwargs["logical_date"].format("YYYY-MM-DD")
    )
    logging.info(f"RUNNING FOR DATE {date}")
    return BranchSummaryDataFetcher(credential=credential.branch_credential, date=date)


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
                column_types={},
            )


@task
def process_and_save_summary_events(
    fetcher: BranchSummaryDataFetcher,
    event_sources: List[str],
    database_details: AppDatabaseResponse,
    clickhouse_server_credentials: Union[ClickHouseRemoteConnectionCred, None],
):
    saver = BranchDataSaver(
        app_id=datasource.appId,
        clickhouse_server_credentials=clickhouse_server_credentials,
    )
    for event_source in event_sources:
        for events in fetcher.fetch_branch_summary(event_source=event_source):
            source = "_".join(event_source.split("_")[1:])
            clean_data = BranchSummaryEventProcessor().process(
                events_data=events, source=source
            )
            saver.save(
                table_name=f"summary_{source}",
                database_name=database_details.database_credentials.databasename,
                event_data=clean_data,
                column_types={source: "Int"},
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
    branch_task_retries = int(
        Variable.get("branch_task_retries", default_var=DAG_RETRIES)
    )
    branch_task_retry_delay = int(
        Variable.get("branch_task_retry_delay", default_var=DAG_RETRY_DELAY)
    )
    dag_start_date = Variable.get("dag_start_date", default_var="2024-05-01")

    @dag(
        dag_id=f"branch_data_loader_{datasource_id}",
        description=f"Branch daily refresh for {datasource_id}",
        schedule="0 12 * * *",
        start_date=pendulum.instance(
            datetime.strptime(dag_start_date, "%Y-%m-%d"),
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
        default_args={
            "retries": branch_task_retries,
            "retry_delay": timedelta(minutes=branch_task_retry_delay),
            "retry_exponential_backoff": True,
            "on_failure_callback": [send_failure_alert_to_slack],
        },
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

    @dag(
        dag_id=f"branch_summary_data_loader_{datasource_id}",
        description=f"Branch summary data daily ingestion for {datasource_id}",
        schedule="0 12 * * *",
        start_date=pendulum.instance(
            datetime.strptime(dag_start_date, "%Y-%m-%d"),
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
        tags=[f"branch-daily-summary-data-fetch"],
        # default_args={
        #     "retries": branch_task_retries,
        #     "retry_delay": timedelta(minutes=branch_task_retry_delay),
        #     "retry_exponential_backoff": True,
        # },
        default_args={
            "on_failure_callback": [send_failure_alert_to_slack],
        },
    )
    def branch_summary_data_ingestion():
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        datasource = datasource_with_credential["datasource"]
        credential = datasource_with_credential["credential"]
        clickhouse_server_credential = get_clickhouse_server_credential(
            datasource=datasource
        )
        app_database_details = get_app_database(datasource=datasource)
        fetcher = create_branch_summary_fetcher(credential=credential)
        event_sources = ["eo_install", "xx_click", "eo_click", "eo_open"]

        process_and_save_summary_events(
            event_sources=event_sources,
            fetcher=fetcher,
            database_details=app_database_details,
            clickhouse_server_credentials=clickhouse_server_credential,
        )

    branch_summary_data_ingestion()


datasources = datasource_service.get_datasources_for_provider(provider=provider)

for datasource in datasources:
    create_dag(datasource_id=datasource.id, created_date=datasource.createdAt)
