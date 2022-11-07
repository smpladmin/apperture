import pandas as pd
from .cleaner import Cleaner


class AmplitudeAnalyticsCleaner(Cleaner):
    def clean(self, df: pd.DataFrame()) -> pd.DataFrame():
        event_properties = pd.json_normalize(df["event_properties"])
        properties = df[
            ["user_id", "os_name", "city", "region", "country", "event_type"]
        ]
        properties = properties.fillna("")
        cleaned_df = event_properties[["name", "timestamp"]]
        cleaned_df["properties"] = properties.to_dict(orient="records")
        cleaned_df.rename(columns={"name": "eventName"}, inplace=True)
        return cleaned_df
