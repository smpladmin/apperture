import logging
from smart_open import open as sopen

from domain.common.models import DataFormat


class EventFetcher:
    def __init__(self, url: str, data_format: DataFormat):
        self.data_format = data_format
        self.open_format = "rb" if self.data_format == DataFormat.BINARY else "r"
        self.data_url = url

    def open(self):
        logging.info(f"Beginning to fetch events data from {self.data_url}")
        return sopen(self.data_url, self.open_format)

    def fetch(self):
        events_data = b"" if self.data_format == DataFormat.BINARY else ""
        with self.open() as source:
            for data in source:
                events_data += data

        return events_data
