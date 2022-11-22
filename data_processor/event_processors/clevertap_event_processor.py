import io
import zipfile
import zlib
import pandas as pd
import datetime
import re

from .event_processor import EventProcessor


class ClevertapEventProcessor(EventProcessor):
    def process(self, events_data):
        df = events_data
        return self.process_dataframe(df)

    def process_dataframe(self, df):
        cleaned_df = pd.DataFrame()
        cleaned_df["userId"] = df["profile.objectId"]
        cleaned_df["timestamp"] = df["ts"].apply(
            lambda x: datetime.strptime(str(x), "%Y%m%d%H%M%S")
        )
        df["eventsName"] = df.filter(regex="profile\.events\..*\.count").idxmax(axis=1)
        cleaned_df["eventName"] = df["eventsName"].apply(
            lambda event: re.search("profile\.events\.(.*)\.count", event).group(1)
        )
        cleaned_df["properties"] = df
        return cleaned_df
