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
        self.request_data = {"from": int(self.date), "to": int(self.date)}
        self.data_url = (
            credential.api_base_url or "https://in1.api.clevertap.com/1/events.json"
        )

    def get_start_cursor(self, event: str):
        logging.info(
            f"Beginning to fetch event {event} data from start={self.date} & end={self.date}"
        )
        json_data = json.dumps({**self.request_data, "event_name": event})
        logging.info(json_data)
        request_cursor = requests.post(
            self.data_url,
            headers=self.headers,
            params=self.params,
            data=json_data,
        )
        logging.info(request_cursor.content)
        return json.loads(request_cursor.content).get("cursor")

    def open(self):
        events_data_response = requests.post(
            f"{self.data_url}?cursor={self.cursor}",
            headers=self.headers,
        )
        return json.loads(events_data_response.content)

    def fetch(self, event: str):
        self.cursor = self.get_start_cursor(event)

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
