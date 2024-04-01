from datetime import datetime
import logging
from typing import List, Union
import requests

from domain.datasource.models import FacebookAdsCredential


class FacebookAdsFetcher:
    def __init__(self, credential: FacebookAdsCredential, date: str):
        self.ads_params = {
            "fields": "id,name",
            "limit": 200,
            "access_token": credential.access_token,
        }
        self.insights_params = {
            "fields": "account_id,account_name,campaign_id,campaign_name,adset_id,adset_name,impressions,clicks,spend,account_currency,cpm,cpc,ctr,cpp,reach",
            "breakdowns": "age,gender",
            "limit": 200,
            "time_range": f"{{'since':'{date}','until':'{date}'}}",
            "access_token": credential.access_token,
        }
        self.date = date
        self.credential = credential
        self.base_url = "https://graph.facebook.com/v18.0"

    def get_ads(self, account_id: str, after: Union[str, None]):
        ads_url = self.base_url + f"/act_{account_id}/ads"
        params = self.ads_params
        if after:
            params["after"] = after

        ads_response = requests.get(
            ads_url,
            params=params,
        )
        if ads_response.ok:
            return ads_response.json()
        else:
            raise Exception(f"Could not fetch ads: {ads_response.json()}")

    def fetch_ads(self) -> List[dict]:
        account_ids = self.credential.account_ids
        ads = []

        for account_id in account_ids:
            after = None
            has_next_page = True

            while has_next_page:
                response = self.get_ads(account_id=account_id, after=after)
                ads.extend(response["data"])

                if (
                    "paging" in response
                    and "next" in response["paging"]
                    and "cursors" in response["paging"]
                ):
                    after = response["paging"]["cursors"]["after"]
                else:
                    has_next_page = False
        logging.info(f"Fetched total {len(ads)} ads ")
        return ads

    def get_ad_insights(self, ad_id: str, after: Union[str, None]):
        insights_url = self.base_url + f"/{ad_id}/insights"
        params = self.insights_params

        if after:
            params["after"] = after

        insights_response = requests.get(
            insights_url,
            params=params,
        )

        if insights_response.ok:
            return insights_response.json()
        else:
            raise Exception(
                f"Could not fetch insights for {ad_id}: {insights_response.json()}"
            )

    def fetch_ads_insights(self, ads: List[dict]):
        insights_data = []

        for ad in ads:
            after = None
            has_next_page = True

            while has_next_page:
                response = self.get_ad_insights(ad_id=ad["id"], after=after)
                data = response["data"]
                date = datetime.strptime(self.date, "%Y-%m-%d")

                for entry in data:
                    entry.update(
                        {"ad_id": ad["id"], "ad_name": ad["name"], "date": date}
                    )

                insights_data.extend(data)

                if (
                    "paging" in response
                    and "next" in response["paging"]
                    and "cursors" in response["paging"]
                ):
                    after = response["paging"]["cursors"]["after"]
                else:
                    has_next_page = False

        logging.info(f"Fetched {len(insights_data)} insights")
        return insights_data
