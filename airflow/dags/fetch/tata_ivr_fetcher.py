import logging
import json
import requests
from datetime import datetime
from domain.datasource.models import Credential


class TataIVREventsFetcher:
    def __init__(self, credential: Credential, date: datetime):
        self.headers = {
            "Authorization": credential.tata_ivr_token,
            "accept": "application/json",
        }

        self.date = date
        self.from_date = date.replace(hour=0, minute=0, second=0).strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        self.to_date = date.replace(hour=23, minute=59, second=59).strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        self.data_url = "https://api-smartflo.tatateleservices.com/v1/call/records"

    def request_records(self, page, size):
        logging.info(
            f"Beginning to fetch {size} events from page {page} starting from start={self.from_date} & end={self.to_date}. "
        )
        params = (
            ("from_date", self.from_date),
            ("to_date", self.to_date),
            ("page", page),
            ("limit", size),
        )
        return requests.get(
            self.data_url,
            headers=self.headers,
            params=params,
        )

    def fetch(self):
        page = 1
        have_more_data = True
        total_data = 0
        SIZE = 500

        while have_more_data:
            response = self.request_records(page=page, size=SIZE)
            page += 1
            if response.ok:
                data = response.json()
                count = data["count"]
                results = data["results"]
                if results:
                    page_len = len(results)
                    total_data += page_len
                    logging.info(f"Fetched {total_data} out of {count} ✅")
                    yield results
                else:
                    logging.info(f"Fetched {total_data} out of {count} ✅")
                    have_more_data = False
            else:
                logging.info(f"Cannot fetch data! ❌")
                logging.info(f"{response.json()}")
                have_more_data = False
                raise Exception(f"Request failed")
