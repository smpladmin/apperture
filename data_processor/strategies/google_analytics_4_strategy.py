import os
import traceback
from datetime import date
from dateutil.relativedelta import relativedelta

from clean.google_analytics_cleaner import GoogleAnalyticsCleaner
from fetch.google_analytics import initialize_v4_analytics
from fetch.google_analytics_4_fetcher import GoogleAnalytics4Fetcher
from store.network_graph_saver import NetworkGraphSaver
from .strategy import Strategy
from tenants.tenants_service import TenantsService
from transform.ga_new_rollup import NetworkGraphTransformer


class GoogleAnalytics4Strategy(Strategy):
    def __init__(self, access_token, refresh_token):
        self.tenants_service = TenantsService()
        analytics = initialize_v4_analytics(access_token, refresh_token)
        today = date.today()
        six_months_back = (date.today() + relativedelta(months=-6)).replace(day=1)
        self.fetcher = GoogleAnalytics4Fetcher(
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
