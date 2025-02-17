from datetime import datetime
import logging
import os

from domain.datasource.models import Credential
from google.ads.googleads.client import GoogleAdsClient
from google.protobuf import json_format
import json


class GoogleAdsFetcher:
    def __init__(self, credential: Credential, date: str):
        self.date = date
        self.google_ads_credential = {
            "refresh_token": credential.refresh_token,
            "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET"),
            "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN"),
            "login_customer_id": os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID"),
            "use_proto_plus": False,
        }
        self.customer_id = credential.account_id

        self.query = f"""
            SELECT
                customer.id,
                customer.descriptive_name,
                campaign.id,
                campaign.name,
                ad_group.id,
                ad_group.name,
                ad_group_ad.ad.app_ad.headlines,
                ad_group_ad.ad.id,
                ad_group_ad.ad.name,
                metrics.clicks,
                metrics.impressions,
                metrics.interactions,
                metrics.ctr,
                metrics.average_cpm,
                metrics.average_cpc,
                metrics.average_cpv,
                metrics.average_cpe,
                metrics.average_cost,
                metrics.cost_micros,
                segments.device,
                segments.date,
                segments.ad_network_type
            FROM
                ad_group_ad
            WHERE
                segments.date >= '{date}' AND segments.date <= '{date}'
                AND ad_group_ad.status != 'REMOVED'
        """

    def transform_ads_response(self, response):
        result = []
        for batch in response:
            json_str = json_format.MessageToJson(batch)
            row = json.loads(json_str)
            date = datetime.strptime(row["segments"]["date"], "%Y-%m-%d")
            flattened_row = {
                "customer_id": row["customer"]["id"],
                "customer_name": row["customer"]["descriptiveName"],
                "campaign_id": row["campaign"]["id"],
                "campaign_name": row["campaign"]["name"],
                "ad_group_id": row["adGroup"]["id"],
                "ad_group_name": row["adGroup"]["name"],
                "ad_id": row["adGroupAd"]["ad"]["id"],
                "ad_headlines": [
                    headline["text"]
                    for headline in row["adGroupAd"]["ad"]
                    .get("appAd", {})
                    .get("headlines", [])
                ],
                "clicks": row["metrics"].get("clicks", 0),
                "ctr": row["metrics"].get("ctr", 0.0),
                "impressions": row["metrics"].get("impressions", 0),
                "interactions": row["metrics"].get("interactions", 0),
                "average_cpm": row["metrics"].get("averageCpm", 0.0),
                "average_cpc": row["metrics"].get("averageCpc", 0.0),
                "average_cpv": row["metrics"].get("averageCpv", 0.0),
                "average_cpe": row["metrics"].get("averageCpe", 0.0),
                "average_cost": row["metrics"].get("averageCost", 0.0),
                "cost_micros": row["metrics"].get("costMicros", 0),
                "device": row["segments"]["device"],
                "ad_network_type": row["segments"]["adNetworkType"],
                "date": date,
            }
            result.append(flattened_row)
        return result

    def fetch_ads_data(self):
        logging.info(f"query: {self.query}")
        client = GoogleAdsClient.load_from_dict(self.google_ads_credential)
        ga_service = client.get_service("GoogleAdsService", version="v18")
        try:
            response = ga_service.search(customer_id=self.customer_id, query=self.query)
            return self.transform_ads_response(response)
        except:
            raise Exception(f"Could not fetch ads: {response}")
