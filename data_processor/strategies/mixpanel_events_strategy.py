import logging

import pandas as pd

from clean.mixpanel_analytics_cleaner import MixpanelAnalyticsCleaner
from domain.common.models import IntegrationProvider
from domain.datasource.models import Credential, DataSource
from fetch.mixpanel_events_fetcher import MixpanelEventsFetcher
from store.mixpanel_events_saver import MixpanelEventsSaver
from store.mixpanel_network_graph_saver import MixpanelNetworkGraphSaver
from transform.mixpanel_network_graph_transformer import MixpanelNetworkGraphTransformer


class MixpanelEventsStrategy:
    def __init__(self, datasource: DataSource, credential: Credential, date: str):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.fetcher = MixpanelEventsFetcher(credential, date)
        self.events_saver = MixpanelEventsSaver(credential, date)
        self.cleaner = MixpanelAnalyticsCleaner()
        self.transformer = MixpanelNetworkGraphTransformer()
        self.saver = MixpanelNetworkGraphSaver()

    def execute(self):
        events_data = ""
        with self.fetcher.open() as source:
            with self.events_saver.open() as dest:
                for data in source:
                    dest.write(data.encode())
                    events_data += data
        logging.info(
            f"Saved Event Data to S3 for Mixpanel datasource, name - {self.datasource.name} id - {self.datasource.id} date - {self.date}"
        )
        logging.info(f"Processing events data for date - {self.date}")
        df = pd.read_json(events_data, lines=True)
        df2 = pd.json_normalize(df["properties"])
        df2["eventname"] = df["event"]
        df = df2
        df = self.cleaner.clean(df)
        network_graph_data = self.transformer.transform(df)
        self.saver.save(
            self.datasource.id,
            IntegrationProvider.MIXPANEL,
            network_graph_data,
        )
