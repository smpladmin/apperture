import boto3
import pandas as pd
import os
from datetime import date, timedelta
from pandas import DataFrame
from .fetcher import Fetcher
from .report_timeframe import ReportTimeframe


class MixpanelAnalyticsFetcher(Fetcher):
    def daily_data(self, app_id: str) -> DataFrame:
        return self.timeframe_data(ReportTimeframe.DAILY, app_id)

    def monthly_data(self) -> DataFrame:
        pass

    def timeframe_data(self, timeframe: ReportTimeframe, app_id: str):
        print(f"Starting data fetch for timeframe {timeframe.name}")
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        s3_file_name = f"{app_id}/{yesterday.replace('-', '/')}/fullday/data"

        s3 = boto3.resource("s3")
        response = (
            s3.Object(os.getenv("MIXPANEL_S3_BUCKET"), s3_file_name)
            .get()["Body"]
            .read()
        )
        print("fetched data")
        df = pd.read_json(response.decode("utf8"), lines=True)
        df2 = pd.json_normalize(df["properties"])
        df2["eventname"] = df["event"]
        print("created DF")
        return df2
