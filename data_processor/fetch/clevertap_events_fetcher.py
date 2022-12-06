import logging
import json
import requests

from domain.datasource.models import Credential


class ClevertapEventsFetcher:
    def __init__(self, credential: Credential, date: str):
        self.headers = {
            "X-CleverTap-Account-Id": credential.account_id,
            "X-CleverTap-Passcode": credential.secret,
            "Content-Type": "application/json",
        }
        self.params = (("batch_size", "50000"),)
        self.date = date.replace("-", "")
        self.request_data = (
            f'"event_name":"UTM Visited","from":{self.date},"to":{self.date} '
        )
        self.request_data = "{" + self.request_data + "}"
        self.url = "https://api.clevertap.com"
        self.data_url = f"{self.url}/1/events.json"

    def get_start_cursor(self):

        logging.info(
            f"Beginning to fetch events data from start={self.date} & end={self.date}"
        )
        request_cursor = requests.post(
            self.data_url,
            headers=self.headers,
            params=self.params,
            data=self.request_data,
        )
        return json.loads(request_cursor.content)["cursor"]

    def open(self):
        events_data_response = requests.post(
            "https://api.clevertap.com/1/events.json?cursor=" + self.cursor,
            headers=self.headers,
        )
        return json.loads(events_data_response.content)

    def fetch(self):
        self.cursor = self.get_start_cursor()

        while self.cursor:
            response = self.open()
            if "records" in response:
                events_data = response["records"]
            else:
                logging.info("Fetching ends: {}")
                break
            logging.info(f"Event data successfully fetched : {len(events_data)}")
            yield events_data
            if "next_cursor" in response:
                self.cursor = response["next_cursor"]
            else:
                self.cursor = None
