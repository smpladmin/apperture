import logging
import os

import requests

from domain.common.models import IntegrationProvider
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.clevertap_events_fetcher import ClevertapEventsFetcher
from store.event_properties_saver import EventPropertiesSaver
from store.events_saver import EventsSaver
from .default_events import default_events

from event_processors.clevertap_event_processor import ClevertapEventProcessor


class ClevertapEventsStrategy:
    def __init__(
        self, datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.runlog_id = runlog_id
        self.fetcher = ClevertapEventsFetcher(credential, date)
        self.event_processor = ClevertapEventProcessor()
        self.saver = EventsSaver()
        self.runlog_service = RunLogService()
        self.properties_saver = EventPropertiesSaver()

    def get_events(self):
        logging.info(
            "{x}: {y}".format(
                x="Requesting events for datasource", y=self.datasource.id
            )
        )

        headers = {
            f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv("BACKEND_API_KEY_SECRET")
        }
        response = requests.get(
            f"{os.getenv('BACKEND_BASE_URL')}/private/integrations/{self.datasource.id}/events",
            headers=headers,
        )
        logging.info("{x}: {y}".format(x="Receieved events:", y=response.status_code))
        return response.json()

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            logging.info(f"Fetching events data for date - {self.date}")
            events = self.get_events() or default_events
            for event in events:
                for events_data in self.fetcher.fetch(event):
                    logging.info(
                        f"Processing event {event} data for date - {self.date}"
                    )
                    df = self.event_processor.process(events_data, event)
                    logging.info(f"Saving event {event} data for date - {self.date}")
                    self.saver.save(
                        self.datasource.id,
                        IntegrationProvider.CLEVERTAP,
                        df,
                    )

                    logging.info(
                        f"Saving event properties for event {event} for date - {self.date}"
                    )
                    self.properties_saver.save(
                        df=df,
                        datasource_id=self.datasource.id,
                        provider=IntegrationProvider.CLEVERTAP,
                    )
            self.runlog_service.update_completed(self.runlog_id)
        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
