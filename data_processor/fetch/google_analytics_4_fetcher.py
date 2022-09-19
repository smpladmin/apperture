from pandas import DataFrame

from .fetcher import Fetcher
from google.analytics.data_v1beta.types import DateRange
from google.analytics.data_v1beta.types import Dimension
from google.analytics.data_v1beta.types import Metric
from google.analytics.data_v1beta.types import RunReportRequest


class GoogleAnalytics4Fetcher(Fetcher):
    def __init__(self, analytics, page_size: int, start_date: str, end_date: str):
        self.analytics = analytics
        self.page_size = page_size
        self.start_date = start_date
        self.end_date = end_date

    def daily_data(self, view_id: str) -> DataFrame:
        request = RunReportRequest(
            property=f"properties/{view_id}",
            dimensions=[Dimension(name="pageReferrer"), Dimension(name="pagepath"), Dimension(name="date")],
            metrics=[Metric(name="screenPageViews"), Metric(name="totalUsers")],
            date_ranges=[DateRange(start_date=self.start_date, end_date=self.end_date)],
        )
        response = self.analytics.run_report(request)
        output = []
        for row in response.rows:
            output.append(
                {
                    "previousPage": row.dimension_values[0].value,
                    "pagePath": row.dimension_values[1].value,
                    "pageViews": row.metric_values[0].value,
                    "users": row.metric_values[1].value,
                    "date": row.dimension_values[2].value,
                }
            )
        df = DataFrame(output)
        return df

    def monthly_data(self) -> DataFrame:
        pass
