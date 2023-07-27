import requests
from domain.common.models import DataFormat
from domain.datasource.models import Credential
import logging
import json


class APIDataFetcher:
    def __init__(self, credential: Credential, date: str):
        self.end_point = credential.account_id
        self.headers = credential.api_key
        self.tableName = credential.tableName
        self.startdate = date
        self.enddate = date
        self.date_args = f"?start_date={self.startdate}&end_date={self.enddate}"
        self.data_url = f"{self.end_point}" + self.date_args + "&offset=0&limit=1000"

    def fetch(self):
        response = requests.get(self.data_url, headers=json.loads(self.headers))
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            logging.info("Error:", response.text)
