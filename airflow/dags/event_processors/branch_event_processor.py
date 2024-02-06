import logging
import pandas as pd
from datetime import datetime
from re import search, sub
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


class BranchSummaryEventProcessor(EventProcessor):
    def process(self, events_data, source: str):
        logging.info(f"DATA recieved {events_data.shape}")
        df = events_data
        return self.process_dataframe(df, source=source)

    def pluralize_source_name(self, source):
        if search("[sxz]$", source) or search("[^aeioudgkprt]h$", source):
            return sub("$", "es", source)
        elif search("[aeiou]y$", source):
            return sub("y$", "ies", source)
        else:
            return source + "s"

    def process_dataframe(self, events_data, source):
        events_data.columns = [
            "ad_partner",
            "campaign",
            "ad_set_name",
            "ad_set_id",
            self.pluralize_source_name(source),
            "timestamp",
        ]
        events_data = events_data.fillna("")
        events_data = events_data.astype(str)
        events_data["timestamp"] = events_data["timestamp"].apply(
            lambda timestamp: datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.%f%z")
        )
        logging.info("DATA CLEANED")
        return events_data
