import logging

from domain.common.models import DataFormat, IntegrationProvider
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.data_orchestrator import DataOrchestrator
from fetch.mixpanel_events_fetcher import MixpanelEventsFetcher
from store.events_saver import EventsSaver

from event_processors.mix_panel_event_processor import MixPanelEventProcessor


class MixpanelEventsStrategy:
    def __init__(
        self, datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.runlog_id = runlog_id
        self.event_processor = MixPanelEventProcessor()
        fetcher = MixpanelEventsFetcher(credential, date, DataFormat.UNICODE)
        self.data_orchestrator = DataOrchestrator(fetcher, DataFormat.UNICODE)
        self.saver = EventsSaver()
        self.runlog_service = RunLogService()

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            events_data = self.data_orchestrator.orchestrate()
            logging.info(f"Processing events data for date - {self.date}")

            events_df = self.event_processor.process(events_data)
            self.saver.save(
                self.datasource.id,
                IntegrationProvider.MIXPANEL,
                events_df,
            )
            self.runlog_service.update_completed(self.runlog_id)
        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
