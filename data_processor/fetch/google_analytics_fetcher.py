import logging
import pandas as pd

from .report_timeframe import ReportTimeframe
from .fetcher import Fetcher


class GoogleAnalyticsFetcher(Fetcher):
    def __init__(self, analytics, page_size: int, start_date: str, end_date: str):
        self.analytics = analytics
        self.page_size = page_size
        self.start_date = start_date
        self.end_date = end_date

    def daily_data(self, view_id: str) -> pd.DataFrame:
        return self.timeframe_data(ReportTimeframe.DAILY, view_id)

    def monthly_data(self) -> pd.DataFrame:
        pass

    def timeframe_data(self, timeframe: ReportTimeframe, view_id: str):
        logging.info("{x}: {y}".format(x="Fetching GA data for", y=view_id))
        logging.info("{x}: {y}".format(x="Start date", y=self.start_date))
        logging.info("{x}: {y}".format(x="End date", y=self.end_date))

        response = self.get_timeframe_report(timeframe, view_id)
        page_token = self.get_page_token(response)
        df = self.parse_data(response)
        if len(df) == 0:
            return df
        logging.info("{x}: {y}".format(x="Length of GA Response", y=len(df)))

        while page_token:
            response = self.get_timeframe_report(timeframe, view_id, page_token)
            page_token = self.get_page_token(response)
            temp = self.parse_data(response)
            df = pd.concat([df, temp])
        df.columns = ["date", "previousPage", "pagePath", "users", "pageViews"]
        logging.info(
            "{x}: {y}".format(x="Done data fetch for timeframe", y=timeframe.name)
        )
        logging.info(df.head(5))
        return df

    def get_timeframe_report(
        self, timeframe: ReportTimeframe, view_id: str, page_token="unknown"
    ):
        logging.info(
            f"Fetching for page - {page_token}",
        )
        return (
            self.analytics.reports()
            .batchGet(
                body={
                    "reportRequests": [
                        {
                            "viewId": view_id,
                            "pageSize": self.page_size,
                            "pageToken": page_token,
                            "dateRanges": [
                                {"startDate": self.start_date, "endDate": self.end_date}
                            ],
                            "metrics": [
                                {"expression": "ga:users"},
                                {"expression": "ga:pageViews"},
                            ],
                            "dimensions": [
                                {"name": f"ga:{timeframe.google_analytics_name()}"},
                                {"name": "ga:previousPagePath"},
                                {"name": "ga:pagePath"},
                            ],
                        }
                    ]
                }
            )
            .execute()
        )

    def get_page_token(self, response):
        page_token = None
        for report in response.get("reports", []):
            page_token = report.get("nextPageToken", None)
        return page_token

    def parse_data(self, response):
        reports = response["reports"][0]
        column_header = reports["columnHeader"]["dimensions"]
        metric_header = reports["columnHeader"]["metricHeader"]["metricHeaderEntries"]
        columns = column_header
        for metric in metric_header:
            columns.append(metric["name"])
        if "rows" not in reports["data"].keys():
            logging.info(
                "{x}: {y}".format(x="GA data not available", y=reports["data"])
            )
            return pd.DataFrame()
        data = pd.json_normalize(reports["data"]["rows"])
        data_dimensions = pd.DataFrame(data["dimensions"].tolist())
        data_metrics = pd.DataFrame(data["metrics"].tolist())
        data_metrics = data_metrics.applymap(lambda x: x["values"])
        data_metrics = pd.DataFrame(data_metrics[0].tolist())
        result = pd.concat([data_dimensions, data_metrics], axis=1, ignore_index=True)
        return result
