import pendulum

from datetime import timedelta
from typing import Dict, Union
from airflow.decorators import task, dag, task_group

from store.events_saver import EventsSaver
from utils.utils import replace_invalid_characters
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


@task()
def fetch(credential: Credential, event: str, **kwargs):
    date = (kwargs["execution_date"] - timedelta(days=1)).format("YYYY-MM-DD")
    return list(
        ClevertapEventsFetcher(credential=credential, date=date).fetch(event=event)
    )


@task(max_active_tis_per_dag=5)
def process(events_data, event: str):
    return ClevertapEventProcessor().process(events_data, event)


@task
def save_events(datasource_id: str, df):
    EventsSaver().save(
        datasource_id=datasource_id,
        provider=provider,
        df=df,
    )


@task
def save_event_properties(datasource_id: str, df):
    EventPropertiesSaver().save(
        df=df,
        datasource_id=datasource_id,
        provider=provider,
    )


@task_group
def process_save(event: str, events_data, datasource_id: str):
    df = process(events_data=events_data, event=event)
    save_events(datasource_id=datasource_id, df=df)
    save_event_properties(datasource_id=datasource_id, df=df)


def create_dag(datasource_id: str, event: str):
    @dag(
        dag_id=f"clevertap_data_loader_{datasource_id}_{replace_invalid_characters(input_string=event)}",
        description=f"Clevertap event: {event} daily refresh for {datasource_id}",
        schedule="0 7 * * *",
        start_date=pendulum.datetime(
            2023, 10, 13, tz=pendulum.timezone("Asia/Kolkata")
        ),
        catchup=False,
        tags=[f"clevertap-daily-data-fetch-{datasource_id}"],
    )
    def clevertap_data_loader(datasource_id: str, event: str):
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        clevertap_data = fetch(
            credential=datasource_with_credential["credential"], event=event
        )
        process_save.partial(datasource_id=datasource_id, event=event).expand(
            events_data=clevertap_data
        )

    clevertap_data_loader(datasource_id=datasource_id, event=event)


datasources = datasource_service.get_datasources_for_provider(provider=provider)

for datasource in datasources:
    events = datasource_service.get_events(datasource=datasource)
    for event in events:
        create_dag(datasource_id=datasource.id, event=event)
