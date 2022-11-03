import pandas as pd

from .event_processor import EventProcessor


class MixPanelEventProcessor(EventProcessor):
    def process(self, events_data):
        df = pd.read_json(events_data, lines=True)
        df2 = pd.json_normalize(df["properties"])
        df2["eventname"] = df["event"]
        return df2
