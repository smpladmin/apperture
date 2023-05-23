import logging

from domain.common.models import DataFormat, IntegrationProvider
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.amplitude_events_fetcher import AmplitudeEventsFetcher
from store.event_properties_saver import EventPropertiesSaver
from store.events_saver import EventsSaver

from event_processors.amplitude_event_processor import AmplitudeEventProcessor


class AmplitudeEventsStrategy:
    def __init__(
        self, datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.runlog_id = runlog_id
        self.fetcher = AmplitudeEventsFetcher(credential, date, DataFormat.BINARY)
        self.event_processor = AmplitudeEventProcessor()
        self.saver = EventsSaver()
        self.runlog_service = RunLogService()
        self.properties_saver = EventPropertiesSaver()

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            logging.info(f"Fetching events data for date - {self.date}")
            events_data = self.fetcher.fetch()
            logging.info(f"Processing events data for date - {self.date}")
            df = self.event_processor.process(events_data)
            logging.info(f"Saving events data for date - {self.date}")
            self.saver.save(
                self.datasource.id,
                IntegrationProvider.AMPLITUDE,
                df,
            )

            self.runlog_service.update_completed(self.runlog_id)

            logging.info(f"Saving event properties for date - {self.date}")
            self.properties_saver.save(
                df=df,
                datasource_id=self.datasource.id,
                provider=IntegrationProvider.AMPLITUDE,
            )

        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
