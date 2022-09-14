import os
from datetime import date
from dateutil.relativedelta import relativedelta

from clean.google_analytics_cleaner import GoogleAnalyticsCleaner
from domain.common.models import IntegrationProvider
from fetch.google_analytics import initialize_v4_analytics
from fetch.google_analytics_4_fetcher import GoogleAnalytics4Fetcher
from store.network_graph_saver import NetworkGraphSaver
from store.ga_cleaned_data_saver import GACleanedDataSaver
from .strategy import Strategy
from tenants.tenants_service import TenantsService
from transform.ga_new_rollup import NetworkGraphTransformer


# TODO: Merge GA v3 and v4 strategies
class GoogleAnalytics4Strategy(Strategy):
    def __init__(
        self,
        access_token,
        refresh_token,
        datasource_id: str,
        provider: IntegrationProvider,
    ):
        self.datasource_id = datasource_id
        self.provider = provider
        self.tenants_service = TenantsService()
        analytics = initialize_v4_analytics(access_token, refresh_token)
        start_date = (date.today() + relativedelta(days=-120))
        end_date = date.today() + relativedelta(days=-1)
        self.fetcher = GoogleAnalytics4Fetcher(
            analytics,
            int(os.environ["PAGE_SIZE"]),
            start_date.isoformat(),
            end_date.isoformat(),
        )
        self.cleaner = GoogleAnalyticsCleaner()
        self.transformer = NetworkGraphTransformer()
        self.saver = NetworkGraphSaver()
        self.cleaned_data_saver = GACleanedDataSaver()

    def execute(self, email, external_source_id):
        df = self.fetcher.daily_data(external_source_id)
        cleaned_data = self.cleaner.clean(df)
        self.cleaned_data_saver.save(self.datasource_id, self.provider, cleaned_data)
        network_graph_data = self.transformer.transform(cleaned_data)
        self.saver.save(self.datasource_id, self.provider, network_graph_data)
