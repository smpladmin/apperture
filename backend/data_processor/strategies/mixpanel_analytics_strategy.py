import pandas as pd
from data_processor.fetch.mixpanel_analytics_fetcher import MixpanelAnalyticsFetcher
from data_processor.clean.mixpanel_analytics_cleaner import MixpanelAnalyticsCleaner
from data_processor.transform.mixpanel_network_graph_transformer import (
    MixpanelNetworkGraphTransformer,
)
from data_processor.strategies.strategy import Strategy
from data_processor.store.mixpanel_network_graph_saver import MixpanelNetworkGraphSaver


class MixpanelAnalyticsStrategy(Strategy):
    def __init__(self):
        self.fetcher = MixpanelAnalyticsFetcher()
        self.cleaner = MixpanelAnalyticsCleaner()
        self.transformer = MixpanelNetworkGraphTransformer()
        self.saver = MixpanelNetworkGraphSaver()

    def execute(self, email: str, view_id: str):
        print("Running strategy for the mixpanel")
        df = self.fetcher.daily_data(view_id)
        df = self.cleaner.clean(df)
        network_graph_data = self.transformer.transform(df)
        self.saver.save(view_id, network_graph_data)
        return df
