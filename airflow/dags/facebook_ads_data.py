import logging
import pendulum

from airflow.models import Param, Variable
from typing import Dict, Union, List
from datetime import timedelta, datetime
from airflow.decorators import task, dag

from domain.datasource.service import DataSourceService
from fetch.facebook_ads_data_fetcher import FacebookAdsFetcher
from event_processors.facebook_ads_data_processor import FacebookAdsDataProcessor
from store.facebook_ads_saver import FacebookAdsDataSaver

from utils.utils import (
    AIRFLOW_INIT_DATE,
    DAG_RETRIES,
    DAG_RETRY_DELAY,
    FACEBOOK_ADS_DATA_FETCH_DAYS_OFFSET,
)
from utils.alerts import send_failure_alert_to_slack
from domain.datasource.models import (
    AppDatabaseResponse,
    IntegrationProvider,
    Credential,
    DataSource,
    ClickHouseRemoteConnectionCred,
)


datasource_service = DataSourceService()
provider = IntegrationProvider.FACEBOOK_ADS


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
def fetch_ads(credential: Credential) -> List[dict]:
    date = datetime.now().strftime("%Y-%m-%d")
    return FacebookAdsFetcher(
        credential=credential.facebook_ads_credential, date=date
    ).fetch_ads()


def generate_dates(start_date: str, end_date: str) -> List[str]:
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")
    return [
        (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range((end_date - start_date).days + 1)
    ]


@task
def get_run_dates(**kwargs):
    start_date = kwargs["params"]["start_date"]
    end_date = kwargs["params"]["end_date"]
    if start_date and end_date:
        run_dates = generate_dates(start_date=start_date, end_date=end_date)
    else:
        run_dates = [kwargs["logical_date"].format("YYYY-MM-DD")]
    print(f"Loading data for the following dates: {run_dates}")
    return run_dates


@task(max_active_tis_per_dag=1)
def process_and_save(
    ads: List[dict],
    datasource: DataSource,
    credential: Credential,
    database_details: AppDatabaseResponse,
    date: str,
    clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
):
    data = FacebookAdsFetcher(
        credential=credential.facebook_ads_credential, date=date
    ).fetch_ads_insights(ads=ads)
    processed_data = FacebookAdsDataProcessor().process(data)

    saver = FacebookAdsDataSaver(
        app_id=datasource.appId,
        clickhouse_server_credentials=clickhouse_server_credential,
    )
    saver.save(
        event_data=processed_data,
        table_name=credential.tableName,
        database_name=database_details.database_credentials.databasename,
    )


def create_dag(datasource_id: str, created_date: datetime):
    facebook_ads_task_retries = int(
        Variable.get("facebook_ads_task_retries", default_var=DAG_RETRIES)
    )
    facebook_ads_task_retry_delay = int(
        Variable.get("facebook_ads_task_retry_delay", default_var=DAG_RETRY_DELAY)
    )
    dag_start_date = Variable.get("dag_start_date", default_var="2024-05-01")

    @dag(
        dag_id=f"facebook_ads_data_loader_{datasource_id}",
        description=f"Facebook ads daily refresh for {datasource_id}",
        schedule="0 8 * * *",
        start_date=pendulum.instance(
            datetime.strptime(dag_start_date, "%Y-%m-%d"),
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        params={
            "start_date": Param(
                "",
                type=["string", "null"],
                format="datetime",
                title="start_date",
                description="Select start date (Leave empty to fetch data for the day prior to the logical date)",
            ),
            "end_date": Param(
                "",
                type=["string", "null"],
                format="datetime",
                title="end_date",
                description="Select end date (Leave empty to fetch data for the day prior to the logical date)",
            ),
        },
        catchup=False,
        tags=[f"facebook-ads-daily-data-fetch"],
        default_args={
            "retries": facebook_ads_task_retries,
            "retry_delay": timedelta(minutes=facebook_ads_task_retry_delay),
            "retry_exponential_backoff": True,
            "on_failure_callback": [send_failure_alert_to_slack],
        },
    )
    def facebook_ads_data_loader():
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        datasource = datasource_with_credential["datasource"]
        credential = datasource_with_credential["credential"]
        run_dates = get_run_dates()
        clickhouse_server_credential = get_clickhouse_server_credential(
            datasource=datasource
        )
        app_database_details = get_app_database(datasource=datasource)

        ads = fetch_ads(credential=credential)
        process_and_save.partial(
            ads=ads,
            datasource=datasource,
            credential=credential,
            database_details=app_database_details,
            clickhouse_server_credential=clickhouse_server_credential,
        ).expand(date=run_dates)

    facebook_ads_data_loader()


datasources = datasource_service.get_datasources_for_provider(provider=provider)

for datasource in datasources:
    create_dag(datasource_id=datasource.id, created_date=datasource.createdAt)
