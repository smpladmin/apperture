import logging
import pendulum

from airflow.models import Param
from typing import Dict, Union, List
from datetime import timedelta, datetime
from airflow.decorators import task, dag

from store.events_saver import EventsSaver
from utils.utils import DATA_FETCH_DAYS_OFFSET
from domain.datasource.service import DataSourceService
from store.event_properties_saver import EventPropertiesSaver
from fetch.clevertap_events_fetcher import ClevertapEventsFetcher
from event_processors.clevertap_event_processor import ClevertapEventProcessor
from domain.datasource.models import IntegrationProvider, Credential, DataSource


datasource_service = DataSourceService()
provider = IntegrationProvider.CLEVERTAP


@task
def get_datasource_and_credential(
    datasource_id: str,
) -> Dict[str, Union[DataSource, Credential]]:
    datasource = datasource_service.get_datasource_with_credential(id=datasource_id)
    return {"datasource": datasource.datasource, "credential": datasource.credential}


@task
def get_events(datasource: DataSource, **kwargs) -> List:
    param_events = kwargs["params"]["events"]
    events = (
        param_events
        if param_events
        else datasource_service.get_events(datasource=datasource)
    )
    print(f"Loading data for following events: {events}")
    return events


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
        run_dates = [(kwargs["logical_date"] - timedelta(days=1)).format("YYYY-MM-DD")]
    print(f"Loading data for the following dates: {run_dates}")
    return run_dates


@task(max_active_tis_per_dag=5)
def load_data(datasource_id: str, credential: Credential, event: str, date: str):
    print(f"Loading data for event: {event} date: {date}")
    for events_data in ClevertapEventsFetcher(credential=credential, date=date).fetch(
        event=event
    ):
        logging.info(f"Processing event {event} data for date - {date}")
        df = ClevertapEventProcessor().process(events_data, event)
        logging.info(f"Saving event {event} data for date - {date}")
        EventsSaver().save(
            datasource_id,
            IntegrationProvider.CLEVERTAP,
            df,
        )

        logging.info(f"Saving event properties for event {event} for date - {date}")
        EventPropertiesSaver().save(
            df=df,
            datasource_id=datasource.id,
            provider=IntegrationProvider.CLEVERTAP,
        )


def create_dag(datasource_id: str, created_date: datetime):
    @dag(
        dag_id=f"clevertap_data_loader_{datasource_id}",
        description=f"Clevertap daily refresh for {datasource_id}",
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
        catchup=False,
        tags=[f"clevertap-daily-data-fetch"],
    )
    def clevertap_data_loader():
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        run_dates = get_run_dates()
        events = get_events(datasource=datasource_with_credential["datasource"])
        load_data.partial(
            datasource_id=datasource_id,
            credential=datasource_with_credential["credential"],
        ).expand(event=events, date=run_dates)

    clevertap_data_loader()


datasources = datasource_service.get_datasources_for_provider(provider=provider)

for datasource in datasources:
    create_dag(datasource_id=datasource.id, created_date=datasource.createdAt)
