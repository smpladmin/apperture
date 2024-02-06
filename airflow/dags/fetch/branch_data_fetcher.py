import requests
import logging
import pandas as pd
from domain.datasource.models import BranchCredential

# from time import sleep
# from ratelimit import limits, sleep_and_retry


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
        if events_data_response.ok and events_data_response.json():
            return events_data_response.json()
        else:
            raise Exception(f"Could not fetch DATA: {events_data_response.json()}")

    def open(
        self,
        file_path: str,
    ):
        return pd.read_csv(file_path, compression="gzip")


class BranchSummaryDataFetcher:
    def __init__(self, credential: BranchCredential, date: str):
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
        }
        self.tries = 1
        self.date = date
        logging.info(f"date: {date}")
        self.request_data = {
            "branch_key": credential.branch_key,
            "branch_secret": credential.branch_secret,
            "start_date": self.date,
            "end_date": self.date,
            "aggregation": "unique_count",
            "dimensions": [
                "last_attributed_touch_data_tilde_advertising_partner_name",
                "last_attributed_touch_data_tilde_campaign",
                "last_attributed_touch_data_tilde_ad_set_name",
                "last_attributed_touch_data_tilde_ad_set_id",
            ],
            "filters": {},
            "enable_install_recalculation": False,
            "granularity": "day",
            "ordered_by": "timestamp",
            "ordered": "ascending",
            "zero_fill": False,
        }
        self.data_url = "https://api2.branch.io/"

    def __del__(self):
        logging.info("DESTRUCTOR:: Fetcher object deleted!")

    # Limit only 120 requests in a minute
    # @sleep_and_retry
    # @limits(calls=120, period=60 * 60)
    def api_call(self, endpoint, request_data):
        url = f"https://api2.branch.io/{endpoint}"
        logging.info(url)
        return requests.post(url, headers=self.headers, json=request_data)

    def fetch_branch_summary(self, event_source):
        endpoint = "v1/query/analytics"
        request_data = {**self.request_data, "data_source": event_source}
        while True:
            # if self.tries % 20 == 0:
            #     # sonly 20 requests are allowed per minute
            #     sleep(60)
            logging.info(f"HEADERS: {self.headers}")
            logging.info(f"JSON: {request_data}")
            response = self.api_call(endpoint=endpoint, request_data=request_data)
            if response.status_code == 200:
                res_data = response.json()
                results = res_data["results"]
                flatten_results = []
                for result in results:
                    flatten_results.append(
                        {**result["result"], "timestamp": result["timestamp"]}
                    )
                self.tries += 1
                yield pd.DataFrame(flatten_results)
                if "paging" in res_data and "next_url" in res_data["paging"]:
                    endpoint = res_data["paging"]["next_url"]
                else:
                    break
            else:
                print(response.json())
                raise Exception("Error fetching data")
