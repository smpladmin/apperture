import logging
import pendulum

from datetime import timedelta
from typing import Dict, List, Union
from airflow.decorators import task, dag

from store.events_saver import EventsSaver
from domain.datasource.service import DataSourceService
from store.event_properties_saver import EventPropertiesSaver
from fetch.clevertap_events_fetcher import ClevertapEventsFetcher
from event_processors.clevertap_event_processor import ClevertapEventProcessor
from domain.datasource.models import IntegrationProvider, DataSource, Credential

datasource_service = DataSourceService()


@task
def get_datasource_and_credential(
    datasource_id: str,
) -> Dict[str, Union[DataSource, Credential]]:
    datasource = datasource_service.get_datasource_with_credential(id=datasource_id)
    return {"datasource": datasource.datasource, "credential": datasource.credential}


@task
def get_events(datasource: DataSource) -> List:
    return datasource_service.get_events(datasource=datasource)


@task(max_active_tis_per_dag=5)
def fetch(datasource: DataSource, credential: Credential, event: str, **kwargs):
    date = (kwargs["execution_date"] - timedelta(days=1)).format("YYYY-MM-DD")
    for events_data in ClevertapEventsFetcher(credential=credential, date=date).fetch(
        event=event
    ):
        logging.info(f"Processing event {event} data for date - {date}")
        df = ClevertapEventProcessor().process(events_data, event)
        logging.info(f"Saving event {event} data for date - {date}")
        EventsSaver().save(
            datasource.id,
            IntegrationProvider.CLEVERTAP,
            df,
        )

        logging.info(f"Saving event properties for event {event} for date - {date}")
        EventPropertiesSaver().save(
            df=df,
            datasource_id=datasource.id,
            provider=IntegrationProvider.CLEVERTAP,
        )


def create_dag(datasource_id: str):
    @dag(
        dag_id=f"clevertap_data_loader_{datasource_id}",
        description=f"Clevertap datasource daily refresh for {datasource_id}",
        schedule="0 7 * * *",
        start_date=pendulum.datetime(
            2023, 10, 13, tz=pendulum.timezone("Asia/Kolkata")
        ),
        catchup=False,
        tags=["clevertap-daily-data-fetch"],
    )
    def clevertap_data_loader(datasource_id: str):
        datasource_with_credential = get_datasource_and_credential(
            datasource_id=datasource_id
        )
        events = get_events(datasource=datasource_with_credential["datasource"])
        fetch.partial(
            datasource=datasource_with_credential["datasource"],
            credential=datasource_with_credential["credential"],
        ).expand(event=events)

    clevertap_data_loader(datasource_id=datasource_id)


datasources = datasource_service.get_datasource_ids_for_provider(
    provider=IntegrationProvider.CLEVERTAP
)

for datasource_id in datasources:
    create_dag(datasource_id=datasource_id)
