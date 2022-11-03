import logging

import pandas as pd
from clean.mixpanel_analytics_cleaner import MixpanelAnalyticsCleaner
from domain.common.models import DataFormat, IntegrationProvider
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.data_orchestrator import DataOrchestrator
from fetch.mixpanel_events_fetcher import MixpanelEventsFetcher
from store.mixpanel_events_saver import S3EventsSaver
from store.mixpanel_network_graph_saver import MixpanelNetworkGraphSaver
from transform.mixpanel_network_graph_transformer import MixpanelNetworkGraphTransformer

from ..event_processors.mix_panel_event_processor import MixPanelEventProcessor


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
        events_saver = S3EventsSaver(credential, date)
        self.data_orchestrator = DataOrchestrator(
            fetcher, events_saver, DataFormat.UNICODE
        )
        self.cleaner = MixpanelAnalyticsCleaner()
        self.transformer = MixpanelNetworkGraphTransformer()
        self.saver = MixpanelNetworkGraphSaver()
        self.runlog_service = RunLogService()

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            events_data = self.data_orchestrator.orchestrate()
            logging.info(
                f"Saved Event Data to S3 for Mixpanel datasource, name - {self.datasource.name} id - {self.datasource.id} date - {self.date}"
            )
            logging.info(f"Processing events data for date - {self.date}")

            df = self.event_processor.process(events_data)
            df = self.cleaner.clean(df)
            network_graph_data = self.transformer.transform(df)
            self.saver.save(
                self.datasource.id,
                IntegrationProvider.MIXPANEL,
                network_graph_data,
            )
            self.runlog_service.update_completed(self.runlog_id)
        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
