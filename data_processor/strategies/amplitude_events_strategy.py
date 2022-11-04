import logging

from clean.amplitude_analytics_cleaner import AmplitudeAnalyticsCleaner
from domain.common.models import DataFormat, IntegrationProvider
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.amplitude_events_fetcher import AmplitudeEventsFetcher
from fetch.data_orchestrator import DataOrchestrator
from store.amplitude_network_graph_saver import AmplitudeNetworkGraphSaver
from transform.amplitude_network_graph_transformer import (
    AmplitudeNetworkGraphTransformer,
)

from event_processors.amplitude_event_processor import AmplitudeEventProcessor


class AmplitudeEventsStrategy:
    def __init__(
        self, datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.runlog_id = runlog_id
        self.event_processor = AmplitudeEventProcessor()
        fetcher = AmplitudeEventsFetcher(credential, date, DataFormat.BINARY)
        self.data_orchestrator = DataOrchestrator(fetcher, DataFormat.BINARY)
        self.cleaner = AmplitudeAnalyticsCleaner()
        self.transformer = AmplitudeNetworkGraphTransformer()
        self.saver = AmplitudeNetworkGraphSaver()
        self.runlog_service = RunLogService()

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            events_data = self.data_orchestrator.orchestrate()
            logging.info(f"Processing events data for date - {self.date}")
            df = self.event_processor.process(events_data)
            logging.info(f"Cleaning data for date - {self.date}")
            df = self.cleaner.clean(df)
            logging.info(f"Transforming data for date - {self.date}")
            network_graph_data = self.transformer.transform(df)

            self.saver.save(
                self.datasource.id,
                IntegrationProvider.AMPLITUDE,
                network_graph_data,
            )

            self.runlog_service.update_completed(self.runlog_id)
        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
