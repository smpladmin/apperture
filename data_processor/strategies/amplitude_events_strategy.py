import logging
import zipfile
import vaex as vx

from clean.amplitude_analytics_cleaner import AmplitudeAnalyticsCleaner
from domain.common.models import IntegrationProvider
from domain.common.models import DataFormat
from domain.datasource.models import Credential, DataSource
from domain.runlog.service import RunLogService
from fetch.data_orchestrator import DataOrchestrator
from fetch.amplitude_events_fetcher import AmplitudeEventsFetcher
from store.mixpanel_events_saver import S3EventsSaver
from store.amplitude_network_graph_saver import AmplitudeNetworkGraphSaver
from transform.amplitude_network_graph_transformer import AmplitudeNetworkGraphTransformer


class MixpanelEventsStrategy:
    def __init__(
        self, datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.runlog_id = runlog_id
        fetcher = AmplitudeEventsFetcher(credential, date, DataFormat.BINARY)
        events_saver = S3EventsSaver(credential, date)
        self.data_orchestrator = DataOrchestrator(fetcher, events_saver,DataFormat.BINARY)
        self.cleaner = AmplitudeAnalyticsCleaner()
        self.transformer = AmplitudeNetworkGraphTransformer()
        self.saver = AmplitudeNetworkGraphSaver()
        self.runlog_service = RunLogService()

    def execute(self):
        try:
            self.runlog_service.update_started(self.runlog_id)
            events_data = self.data_orchestrator.orchestrate()
            logging.info(
                f"Saved Event Data to S3 for Amplitude datasource, name - {self.datasource.name} id - {self.datasource.id} date - {self.date}"
            )
            logging.info(f"Processing events data for date - {self.date}")
            agg_df = None
            with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_source:
                for info in zip_source.infolist():
                    file_bytes = zip_source.read(info.filename)
                    json = zlib.decompress(file_bytes, 15+32)
                    df = vx.from_json(json.decode("utf8"), lines=True)
                    agg_df = vx.concat([agg_df, df]) if agg_df else df
            
             
            # df = self.cleaner.clean(df)
            
            self.runlog_service.update_completed(self.runlog_id)
        except Exception as e:
            self.runlog_service.update_failed(self.runlog_id)
            raise e
