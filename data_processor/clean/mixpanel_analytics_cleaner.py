from .cleaner import Cleaner
import pandas as pd


class MixpanelAnalyticsCleaner(Cleaner):
    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        print("Cleaning data")
        print(df.head(5))
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
