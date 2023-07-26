import gc
import os, psutil
import logging

from domain.common.models import IntegrationProvider
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.api_data_fetcher import APIDataFetcher
from store.api_data_saver import APIDataSaver

from event_processors.api_data_processor import APIDataProcessor


class APIDataStrategy:
    def __init__(
        self, datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.runlog_id = runlog_id
        self.fetcher = APIDataFetcher(credential, date)
        self.event_processor = APIDataProcessor()
        self.saver = APIDataSaver(credential)
        self.runlog_service = RunLogService()

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            api_data = self.fetcher.fetch()
            events_count = len(api_data)
            logging.info(
                f"Processing API chunk for date - {self.date} Chunk size = {events_count}"
            )
            events_df = self.event_processor.process(api_data)
            logging.info(f"Saving events chunk for date - {self.date}")
            self.saver.save(
                self.datasource.id,
                IntegrationProvider.API,
                events_df,
            )
            logging.info(
                f"Memory = {psutil.Process(os.getpid()).memory_info().rss / 1024 ** 2}Mb"
            )
            gc.collect()
            self.runlog_service.update_completed(self.runlog_id)

        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
