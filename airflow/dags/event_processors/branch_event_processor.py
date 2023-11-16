import logging
import pandas as pd
from datetime import datetime

from .event_processor import EventProcessor


class BranchEventProcessor(EventProcessor):
    def process(self, events_data):
        logging.info(f"DATA recieved {events_data.shape}")
        df = events_data
        return self.process_dataframe(df)

    def process_dataframe(self, events_data):
        events_data = events_data.fillna("")
        events_data = events_data.astype(str)
        events_data["timestamp"] = events_data["timestamp"].apply(
            lambda timestamp: datetime.fromtimestamp(int(timestamp) / 1000)
        )
        logging.info("DATA CLEANED")
        return events_data
