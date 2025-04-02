from typing import Dict, Union
import pendulum
from datetime import timedelta
from airflow.decorators import task, dag
from utils.alerts import send_failure_alert_to_slack
from airflow.models import Variable

from fetch.realtime_api_fetcher import RealtimeAPIFetcher
from event_processors.api_data_processor import APIDataProcessor
from store.api_data_saver import APIDataSaver
from domain.datasource.models import AppDatabaseResponse, ClickHouseRemoteConnectionCred, IntegrationProvider

from store.api_data_saver import APIDataSaver
from domain.datasource.service import DataSourceService
from event_processors.api_data_processor import APIDataProcessor
from utils.utils import (
    DAG_RETRIES,
    DAG_RETRY_DELAY,
)
from domain.datasource.models import IntegrationProvider, DataSource, Credential

datasource_service = DataSourceService()

@task
def get_datasource_and_credential(
    datasource_id: str,
) -> Dict[str, Union[DataSource, Credential]]:
    datasource = datasource_service.get_datasource_with_credential(id=datasource_id)
    return {"datasource": datasource.datasource, "credential": datasource.credential}

@task
def get_clickhouse_server_credential(
    datasource: DataSource,
) -> Union[ClickHouseRemoteConnectionCred, None]:
    return datasource_service.get_clickhouse_server_credentials_for_app(
        app_id=datasource.appId
    )

@task
def get_app_database(
    datasource: DataSource,
) -> AppDatabaseResponse:
    return datasource_service.get_database_for_app(app_id=datasource.appId)

@task
def fetch_data(credential: Credential, datasource: DataSource, clickhouse_creds: ClickHouseRemoteConnectionCred, app_database_details: AppDatabaseResponse):
    return RealtimeAPIFetcher(
        credential=credential,
        app_id=datasource.appId,
        clickhouse_server_credentials=clickhouse_creds,
        database_name=app_database_details.database_credentials.databasename,
    ).fetch()

@task
def process_data(api_data):
    return APIDataProcessor().process(events_data=api_data)

@task
def save_data(processed_data, credential: Credential, datasource: DataSource):
    APIDataSaver(credential=credential).save(
        datasource_id=datasource.id,
        provider=IntegrationProvider.API,
        df=processed_data
    )

@dag(
    dag_id='realtime_api_data_loader',
    description='Sangeetha API data loader running every 15 minutes',
    schedule_interval='*/15 * * * *',
    start_date=pendulum.datetime(2025, 4, 1, tz="UTC"),
    catchup=False,
    tags=['realtime-api-fetch'],
    default_args={
        'retries': DAG_RETRIES,
        'retry_delay': timedelta(minutes=DAG_RETRY_DELAY),
        'on_failure_callback': send_failure_alert_to_slack,
    },
)
def realtime_api_data_loader():
    datasource_id = Variable.get("sangeetha_datasource_id", default_var="67ecce960ab9fa2f198413cf")
    
    datasource_with_credential = get_datasource_and_credential(
        datasource_id=datasource_id
    )
    
    datasource = datasource_with_credential["datasource"]
    credential = datasource_with_credential["credential"]
    
    clickhouse_creds = get_clickhouse_server_credential(datasource=datasource)
    
    app_database_details = get_app_database(datasource=datasource)
    api_data = fetch_data(
        credential=credential,
        datasource=datasource,
        clickhouse_creds=clickhouse_creds,
        app_database_details=app_database_details
    )
    processed_data = process_data(api_data)
    save_data(
        processed_data=processed_data,
        credential=credential,
        datasource=datasource,
    )

dag = realtime_api_data_loader()
