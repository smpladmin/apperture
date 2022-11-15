from datetime import datetime
from math import isnan
from flatten_json import flatten
import pandas as pd

from .event_processor import EventProcessor


class MixPanelEventProcessor(EventProcessor):
    def process(self, events_data):
        df = pd.read_json(events_data, lines=True)
        flattened_data = [flatten(d, ".") for d in df.to_dict("records")]
        flattened_df = pd.DataFrame(flattened_data)
        cleaned_df = pd.DataFrame()
        cleaned_df["userId"] = flattened_df["properties.distinct_id"]
        cleaned_df["timestamp"] = flattened_df["properties.time"].apply(
            lambda x: pd.to_datetime(int(x), unit="s", utc=True).strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        )
        cleaned_df["eventName"] = flattened_df.event
        cleaned_df["properties"] = flattened_df.to_dict(orient="records")
        return cleaned_df
