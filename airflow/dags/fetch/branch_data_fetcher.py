import logging
import requests

import gzip
import os
import tempfile
import pandas as pd
from domain.datasource.models import BranchCredential


class BranchDataFetcher:
    def __init__(self, credential: BranchCredential, date: str):
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        self.date = date
        self.params = (("export_date", date),)
        self.request_data = {
            "app_id": credential.app_id,
            "branch_key": credential.branch_key,
            "branch_secret": credential.branch_secret,
            "export_date": self.date,
        }
        self.data_url = "https://api2.branch.io/v3/export"

    def get_branch_details(self):
        events_data_response = requests.post(
            self.data_url,
            headers=self.headers,
            json=self.request_data,
            params=self.params,
        )
        if events_data_response.ok:
            return events_data_response.json()
        else:
            raise Exception(f"Could not fetch DATA: {events_data_response.json()}")

    def open(
        self,
        file_path: str,
    ):
        return pd.read_csv(file_path, compression="gzip")
