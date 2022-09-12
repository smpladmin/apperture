import logging
import pandas as pd
from .saver import Saver


class MixpanelNetworkGraphSaver(Saver):
    def __init__(self):
        self.table = "mixpanel_visualization_data"
        self.schema = "perpendicular"

    def save(self, view_id: str, df: pd.DataFrame):
        logging.info(f"Saving to {self.schema}.{self.table}")
        df["view_id"] = view_id
        df = df.rename(
            columns={
                "previousPage": "previous_page",
                "pagePath": "page_path",
                "utmSource": "utm_source",
                "utmMedium": "utm_medium",
                "appVersion": "app_version",
                "pageViews": "page_views",
                "time": "event_time",
            }
        )
        logging.info(df)
        df.to_sql(
            "mixpanel_visualization_data",
            if_exists="append",
            schema="perpendicular",
            index=False,
        )
        logging.info("SAVED")
