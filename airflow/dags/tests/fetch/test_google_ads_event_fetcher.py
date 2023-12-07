import datetime
import pytest
from unittest.mock import MagicMock, patch

from domain.datasource.models import Credential, CredentialType
from fetch.google_ads_data_fetcher import GoogleAdsFetcher


class TestClevertapEventsFetcher:
    def setup_method(self):
        self.credential = Credential(
            type=CredentialType.GOOGLE_ADS,
            accountId="3R1-AB2-XD1Z",
            secret="",
            refreshToken="3/f0idPayer",
            apiKey=None,
            tableName="google_ads",
            apiBaseUrl=None,
            branchCredential=None,
            facebookAdsCredential=None,
            tata_ivr_token=None,
        )
        self.date = "2023-11-23"
        self.fetcher = GoogleAdsFetcher(self.credential, self.date)

    def test_fetch_ads_data_calls_google_ads_service(
        self,
    ):
        with patch(
            "google.ads.googleads.client.GoogleAdsClient.load_from_dict"
        ) as mock_load_from_dict:
            mock_client = MagicMock()
            mock_load_from_dict.return_value = mock_client

            mock_service = MagicMock()
            mock_client.get_service.return_value = mock_service

            mock_search_response = [
                {
                    "customer": {
                        "id": 1218037894,
                        "descriptive_name": "Wiom_AdWords",
                    },
                    "campaign": {
                        "name": "UAC_Lead_created_eastdelhi_19aug",
                        "id": 20525705476,
                    },
                    "ad_group": {
                        "resource_name": "customers/1218037894/adGroups/153584922896",
                        "id": 153584922896,
                        "name": "Hinglish",
                    },
                    "metrics": {
                        "clicks": 28,
                        "cost_micros": 810900000,
                        "ctr": 0.11914893617021277,
                        "average_cost": 28960714.285714287,
                        "average_cpc": 28960714.285714287,
                        "average_cpm": 3450638297.87234,
                        "impressions": 235,
                        "interactions": 28,
                    },
                    "segments": {
                        "device": "MOBILE",
                        "ad_network_type": "SEARCH",
                        "date": "2023-11-11",
                    },
                }
            ]
            mock_response = [
                {
                    "customer_id": "1218037894",
                    "customer_name": "Wiom_AdWords",
                    "campaign_id": "20525705476",
                    "campaign_name": "UAC_Lead_created_eastdelhi_19aug",
                    "ad_group_id": "153584922896",
                    "ad_group_name": "Hinglish",
                    "clicks": 28,
                    "cost_micros": 810900000,
                    "ctr": 0.11914893617021277,
                    "average_cost": 28960714.285714287,
                    "average_cpc": 28960714.285714287,
                    "average_cpm": 3450638297.87234,
                    "impressions": 235,
                    "interactions": 28,
                    "ad_id": "673977035663",
                    "device": "MOBILE",
                    "ad_network_type": "SEARCH",
                    "date": datetime.datetime(2023, 11, 11, 0, 0),
                }
            ]
            self.fetcher.transform_ads_response = MagicMock(return_value=mock_response)
            mock_service.search.return_value = MagicMock()
            ads_data = self.fetcher.fetch_ads_data()

            mock_service.search.assert_called_once_with(
                **{
                    "customer_id": "3R1-AB2-XD1Z",
                    "query": "\n            SELECT\n                customer.id,\n                customer.descriptive_name,\n                campaign.id,\n                campaign.name,\n                ad_group.id,\n                ad_group.name,\n                ad_group_ad.ad.app_ad.headlines,\n                ad_group_ad.ad.id,\n                ad_group_ad.ad.name,\n                metrics.clicks,\n                metrics.impressions,\n                metrics.interactions,\n                metrics.ctr,\n                metrics.average_cpm,\n                metrics.average_cpc,\n                metrics.average_cpv,\n                metrics.average_cpe,\n                metrics.average_cost,\n                metrics.cost_micros,\n                segments.device,\n                segments.date,\n                segments.ad_network_type\n            FROM\n                ad_group_ad\n            WHERE\n                segments.date >= '2023-11-23' AND segments.date <= '2023-11-23'\n                AND ad_group_ad.status != 'REMOVED'\n        ",
                }
            )
            assert ads_data == mock_response

    def test_fetch_ads_data_handles_exception(self):
        with patch(
            "google.ads.googleads.client.GoogleAdsClient.load_from_dict"
        ) as mock_load_from_dict:
            mock_client = MagicMock()
            mock_load_from_dict.return_value = mock_client

            mock_service = MagicMock()
            mock_client.get_service.return_value = mock_service

            mock_service.search.side_effect = Exception("Some error")

            with pytest.raises(Exception):
                self.fetcher.fetch_ads_data()
