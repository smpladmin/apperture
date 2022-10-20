import logging
from smart_open import open as sopen

from domain.common.models import DataFormat
from domain.datasource.models import Credential


class EventFetcher:
    def __init__(self,url:str, data_format:DataFormat): 
        self.data_format= "rb" if data_format == DataFormat.BINARY else "r"
        self.data_url = url

    def open(self):
        logging.info(f"Beginning to fetch events data from {self.data_url}")
        return sopen(self.data_url,self.data_format)
