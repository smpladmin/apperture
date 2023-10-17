import requests
from dags.domain.datasource.models import Credential
import logging
import json
from datetime import datetime, timedelta


class APIDataFetcher:
    def __init__(self, credential: Credential, date: str):
        self.end_point = credential.account_id
        self.headers = credential.api_key
        self.tableName = credential.tableName
        self.startdate = date
        self.enddate = (
            datetime.strptime(date, "%Y-%m-%d") + timedelta(days=1)
        ).strftime("%Y-%m-%d")

        self.date_args = f"?start_time={self.startdate}&end_time={self.enddate}"
        self.data_url = f"{self.end_point}{self.date_args}&offset=0&limit=1000"

    def fetch(self):
        response = requests.get(self.data_url, headers=json.loads(self.headers))
        if response.status_code == 200:
            data = response.json()
            return data
        else:
            logging.info("Error:", response.text)
