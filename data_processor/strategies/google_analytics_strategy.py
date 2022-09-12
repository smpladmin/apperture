import logging
import os
import traceback
from datetime import date

from dateutil.relativedelta import relativedelta

from clean.google_analytics_cleaner import GoogleAnalyticsCleaner
from domain.common.models import IntegrationProvider
from fetch.google_analytics import initialize_v3_analytics
from fetch.google_analytics_fetcher import GoogleAnalyticsFetcher
from store.network_graph_saver import NetworkGraphSaver
from strategies.strategy import Strategy
from tenants.tenants_service import TenantsService
from transform.ga_new_rollup import NetworkGraphTransformer


class GoogleAnalyticsStrategy(Strategy):
    def __init__(
        self,
        access_token: str,
        refresh_token: str,
        datasource_id: str,
        provider: IntegrationProvider,
    ):
        self.datasource_id = datasource_id
        self.provider = provider
        self.tenants_service = TenantsService()
        analytics = initialize_v3_analytics(access_token, refresh_token)
        # TODO: Abstract date logic, duplicated in v3 and v4 strategies
        yesterday = date.today() + relativedelta(days=-1)
        months_back = (date.today() + relativedelta(months=-3)).replace(day=1)
        self.fetcher = GoogleAnalyticsFetcher(
            analytics,
            int(os.environ["PAGE_SIZE"]),
            months_back.isoformat(),
            yesterday.isoformat(),
        )
        self.cleaner = GoogleAnalyticsCleaner()
        self.transformer = NetworkGraphTransformer()
        self.saver = NetworkGraphSaver()

    def execute(self, email, external_source_id):
        df = self.fetcher.daily_data(external_source_id)
        cleaned_data = self.cleaner.clean(df)
        network_graph_data = self.transformer.transform(cleaned_data)
        self.saver.save(self.datasource_id, self.provider, network_graph_data)
