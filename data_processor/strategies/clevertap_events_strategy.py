import logging

from domain.common.models import IntegrationProvider
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.clevertap_events_fetcher import ClevertapEventsFetcher
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

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            logging.info(f"Fetching events data for date - {self.date}")
            for event in default_events:
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

            self.runlog_service.update_completed(self.runlog_id)
        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
