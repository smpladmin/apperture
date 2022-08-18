import os
import traceback
from datetime import date

from dateutil.relativedelta import relativedelta

from data_processor.clean.google_analytics_cleaner import GoogleAnalyticsCleaner
from data_processor.fetch.google_analytics import initialize_v3_analytics
from data_processor.fetch.google_analytics_fetcher import GoogleAnalyticsFetcher
from data_processor.store.network_graph_saver import NetworkGraphSaver
from data_processor.strategies.strategy import Strategy
from tenants.tenants_service import TenantsService
from data_processor.transform.network_graph_transformer import NetworkGraphTransformer


class GoogleAnalyticsStrategy(Strategy):
    def __init__(self, access_token, refresh_token):
        self.tenants_service = TenantsService()
        analytics = initialize_v3_analytics(access_token, refresh_token)
        today = date.today()
        six_months_back = (date.today() + relativedelta(months=-6)).replace(day=1)
        self.fetcher = GoogleAnalyticsFetcher(
            analytics,
            int(os.environ["PAGE_SIZE"]),
            six_months_back.isoformat(),
            today.isoformat(),
        )
        self.cleaner = GoogleAnalyticsCleaner()
        self.transformer = NetworkGraphTransformer()
        self.saver = NetworkGraphSaver()

    def execute(self, email, app_id):
        try:
            df = self.fetcher.daily_data(app_id)
            cleaned_data = self.cleaner.clean(df)
            network_graph_data = self.transformer.transform(cleaned_data)
            self.saver.save(app_id, network_graph_data)
        except Exception as err:
            traceback.print_exc()
