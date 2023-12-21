import logging
from store.tata_ivr_saver import TataIVRDataSaver
from event_processors.tata_ivr_event_processor import TataIVREventProcessor
from fetch.tata_ivr_fetcher import TataIVREventsFetcher
import pendulum

from airflow.models import Param
from typing import Dict, Union, List
from datetime import timedelta, datetime
from airflow.decorators import task, dag

from domain.datasource.service import DataSourceService
from utils.utils import (
    DAG_RETRIES,
    DAG_RETRY_DELAY,
    DATA_FETCH_DAYS_OFFSET,
    AIRFLOW_INIT_DATE,
)
from domain.datasource.models import (
    IntegrationProvider,
    Credential,
    DataSource,
    ClickHouseRemoteConnectionCred,
)


datasource_service = DataSourceService()
provider = IntegrationProvider.TATA_IVR


@task
def get_datasource_and_credential(
    datasource_id: str,
) -> Dict[str, Union[DataSource, Credential]]:
    datasource = datasource_service.get_datasource_with_credential(id=datasource_id)
    return {"datasource": datasource.datasource, "credential": datasource.credential}


def generate_dates(start_date: datetime, end_date: datetime) -> List[datetime]:
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    return [
        (start_date + timedelta(days=i))
        for i in range((end_date - start_date).days + 1)
    ]


@task
def get_run_dates(**kwargs):
    start_date = kwargs["params"]["start_date"]
    end_date = kwargs["params"]["end_date"]
    if start_date and end_date:
        run_dates = generate_dates(start_date=start_date, end_date=end_date)
    else:
        run_dates = [kwargs["logical_date"]]
    print(f"Loading data for the following dates: {run_dates}")
    return run_dates


@task
def get_clickhouse_server_credential(
    datasource: DataSource,
) -> Union[ClickHouseRemoteConnectionCred, None]:
    return datasource_service.get_clickhouse_server_credentials_for_app(
        app_id=datasource.appId
    )


@task(max_active_tis_per_dag=1)
def load_data(
    datasource: DataSource,
    credential: Credential,
    date: datetime,
    clickhouse_server_credential: Union[ClickHouseRemoteConnectionCred, None],
):
    print(f"Loading data for date: {date}")
    saver = TataIVRDataSaver(
        app_id=datasource.appId,
        clickhouse_server_credentials=clickhouse_server_credential,
    )
    for events in TataIVREventsFetcher(credential=credential, date=date).fetch():
        event_data = TataIVREventProcessor().process(
            events_data=events, datasource_id=str(datasource.id)
        )
        logging.info(f"Processed {event_data.shape} data")
        saver.save(event_data=event_data)


def create_dag(datasource_id: str, created_date: datetime):
    @dag(
        dag_id=f"tata_ivr_data_ingestion_{datasource_id}",
        description=f"TATA IVR daily refresh for {datasource_id}",
        schedule="0 8 * * *",
        start_date=pendulum.instance(
            created_date - timedelta(days=DATA_FETCH_DAYS_OFFSET),
            tz=pendulum.timezone("Asia/Kolkata"),
        ),
        params={
            "events": Param(
                [],
                description="""Add specific events to fetch data for.
                               Add 1 event per line.
                               (Leave empty to fetch for all events)""",
            ),
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
        catchup=(created_date > AIRFLOW_INIT_DATE),
        tags=[f"clevertap-daily-data-fetch"],
        default_args={
            "retries": DAG_RETRIES,
            "retry_delay": timedelta(minutes=DAG_RETRY_DELAY),
        },
    )
    def clevertap_data_loader():
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        datasource = datasource_with_credential["datasource"]
        run_dates = get_run_dates()
        clickhouse_server_credential = get_clickhouse_server_credential(
            datasource=datasource
        )

        load_data.partial(
            datasource=datasource,
            credential=datasource_with_credential["credential"],
            clickhouse_server_credential=clickhouse_server_credential,
        ).expand(date=run_dates)

    clevertap_data_loader()


datasources = datasource_service.get_datasources_for_provider(provider=provider)

for datasource in datasources:
    create_dag(datasource_id=datasource.id, created_date=datasource.createdAt)
