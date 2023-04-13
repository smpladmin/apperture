import pandas as pd
from datetime import datetime

from .event_processor import EventProcessor


class ClevertapEventProcessor(EventProcessor):
    def process(self, events_data, event):
        df = events_data
        return self.process_dataframe(df, event)

    def process_dataframe(self, events_data, event):
        df = pd.json_normalize(events_data)
        cleaned_df = pd.DataFrame()
        cleaned_df["userId"] = df["profile.objectId"]
        cleaned_df["timestamp"] = df["ts"].apply(
            lambda x: datetime.strptime(str(x), "%Y%m%d%H%M%S").strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        )
        cleaned_df["eventName"] = event
        cleaned_df["properties"] = df.to_dict(orient="records")
        return cleaned_df
