import pandas as pd
from .event_processor import EventProcessor


class APIDataProcessor(EventProcessor):
    def process(self, events_data):
        df = pd.DataFrame(events_data)
        df.index = range(len(df))
        return df
