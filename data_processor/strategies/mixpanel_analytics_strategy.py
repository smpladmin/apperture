import logging

from clean.mixpanel_analytics_cleaner import MixpanelAnalyticsCleaner
from fetch.mixpanel_analytics_fetcher import MixpanelAnalyticsFetcher
from store.events_saver import EventsSaver
from strategies.strategy import Strategy
from transform.mixpanel_network_graph_transformer import MixpanelNetworkGraphTransformer


class MixpanelAnalyticsStrategy(Strategy):
    def __init__(self):
        self.fetcher = MixpanelAnalyticsFetcher()
        self.cleaner = MixpanelAnalyticsCleaner()
        self.transformer = MixpanelNetworkGraphTransformer()
        self.saver = EventsSaver()

    def execute(self, email: str, external_source_id: str):
        logging.info("Running strategy for the mixpanel")
        df = self.fetcher.daily_data(external_source_id)
        df = self.cleaner.clean(df)
        network_graph_data = self.transformer.transform(df)
        self.saver.save(external_source_id, network_graph_data)
        return df
