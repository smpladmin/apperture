from datetime import datetime
from math import isnan
from flatten_json import flatten
import pandas as pd
from .event_processor import EventProcessor


class APIDataProcessor(EventProcessor):
    def process(self, events_data):
        df = pd.DataFrame(events_data)
        return df
