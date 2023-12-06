import logging
from datetime import datetime
import pandas as pd


from .event_processor import EventProcessor


class GoogleAdsDataProcessor(EventProcessor):
    def process(self, data):
        df = pd.DataFrame(data)
        logging.info(f"DATA recieved {df.shape}")
        return self.process_dataframe(df)

    def process_dataframe(self, ads_data: pd.DataFrame):
        if not ads_data.empty:
            numeric_cols = [
                "impressions",
                "clicks",
                "interactions",
                "cost_micros",
                "average_cpm",
                "average_cpc",
                "average_cpv",
                "average_cpe",
                "average_cost",
                "ctr",
            ]
            ads_data[numeric_cols] = ads_data[numeric_cols].apply(
                pd.to_numeric, errors="coerce"
            )
            ads_data["date"] = ads_data["date"].apply(
                lambda x: datetime.strptime(str(x), "%Y-%m-%d %H:%M:%S")
            )
        logging.info("Data processed")
        return ads_data
