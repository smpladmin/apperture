import logging

import pandas as pd

from .cleaner import Cleaner


class MixpanelAnalyticsCleaner(Cleaner):
    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        logging.info("Cleaning data")
        logging.info(df.head(5))
        df.rename(
            columns={
                "$city": "city",
                "$region": "region",
                "$os": "os",
                "$app_version": "app_version",
            },
            inplace=True,
        )
        return df
