import logging
import requests

from domain.common.models import DataFormat
from domain.datasource.models import Credential

from .event_fetcher import EventFetcher


class AmplitudeEventsFetcher():
    def __init__(self, credential: Credential, date: str, data_format: DataFormat):
        self.date = date.replace("-", "")
        self.url = "amplitude.com/api/2/export"
        self.data_url = f"https://{credential.api_key}:{credential.secret}@{self.url}?start={self.date}T00&end={self.date}T23"
    
    def open(self):
        logging.info(f"Beginning to fetch events data from start={self.date}T00&end={self.date}T23")
        data= requests.get(self.data_url)
        logging.info(f"Event data successfully fetched ")
        return data.content

    def fetch(self):
        events_data= self.open()

        return events_data
