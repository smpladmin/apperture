import pendulum
from typing import Dict, Union
from datetime import timedelta, datetime
from airflow.decorators import task, dag, task_group
from airflow.models import Variable


from store.api_data_saver import APIDataSaver
from fetch.api_data_fetcher import APIDataFetcher
from domain.datasource.service import DataSourceService
from event_processors.api_data_processor import APIDataProcessor
from utils.utils import (
    DAG_RETRIES,
    DAG_RETRY_DELAY,
    DATA_FETCH_DAYS_OFFSET,
    AIRFLOW_INIT_DATE,
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
def get_last_n_days(n: int, **kwargs):
    return [
        (kwargs["logical_date"] - timedelta(days=i)).format("YYYY-MM-DD")
        for i in range(0, n)
    ]


@task
def fetch(credential: Credential, date: str):
    print(f"Executing workflow for {date}")
    return APIDataFetcher(
        credential=credential,
        date=date,
    ).fetch()


@task(trigger_rule="all_done")
def process(api_data):
    return APIDataProcessor().process(events_data=api_data)


@task(trigger_rule="all_done")
def save(datasource: DataSource, credential: Credential, processed_api_data):
    APIDataSaver(credential=credential).save(
        datasource_id=datasource.id,
        provider=IntegrationProvider.API,
        df=processed_api_data,
    )


@task_group
def fetch_process_save(date: str, credential: Credential, datasource: DataSource):
    api_data = fetch(credential=credential, date=date)
    processed_api_data = process(api_data=api_data)
    save(
        processed_api_data=processed_api_data,
        datasource=datasource,
        credential=credential,
    )


def create_dag(datasource_id: str, num_days: int, created_date: datetime):
    api_task_retries = int(Variable.get("api_task_retries", default_var=DAG_RETRIES))
    api_task_retry_delay = int(
        Variable.get("api_task_retry_delay", default_var=DAG_RETRY_DELAY)
    )
    dag_start_date = Variable.get("dag_start_date", default_var="2024-05-01")

    @dag(
        dag_id=f"api_data_loader_{datasource_id}",
        description=f"API datasource daily refresh for {datasource_id}",
        schedule="0 7 * * *",
        start_date=pendulum.instance(
            datetime.strptime(dag_start_date, "%Y-%m-%d"),
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        catchup=(created_date > AIRFLOW_INIT_DATE),
        tags=["api-daily-data-fetch"],
        default_args={
            "retries": api_task_retries,
            "retry_delay": timedelta(minutes=api_task_retry_delay),
        },
    )
    def api_data_loader(datasource_id: str, num_days: int):
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        dates = get_last_n_days(n=num_days)
        fetch_process_save.partial(
            credential=datasource_with_credential["credential"],
            datasource=datasource_with_credential["datasource"],
        ).expand(date=dates)

    api_data_loader(datasource_id=datasource_id, num_days=num_days)


datasources = datasource_service.get_datasources_for_provider(
    provider=IntegrationProvider.API
)

for datasource in datasources:
    create_dag(
        datasource_id=datasource.id, num_days=7, created_date=datasource.createdAt
    )
