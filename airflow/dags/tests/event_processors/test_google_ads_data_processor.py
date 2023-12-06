from datetime import datetime
from event_processors.google_ads_data_processor import GoogleAdsDataProcessor
import pandas as pd


class TestGoogleAdsDataProcessor:
    def setup_method(self):
        self.processor = GoogleAdsDataProcessor()

        self.mock_data = [
            {
                "customer_id": "1218037894",
                "customer_name": "Wiom_AdWords",
                "campaign_id": "20551536608",
                "campaign_name": "UAC_Lead_created_restofdelhi_14sept",
                "ad_group_id": "148709170010",
                "ad_group_name": "Hinglish",
                "clicks": "10",
                "ctr": 0.0970873786407767,
                "impressions": "103",
                "interactions": "10",
                "average_cpm": 3279805825.242718,
                "average_cpc": 33782000.0,
                "average_cpv": 0.0,
                "average_cpe": 0.0,
                "average_cost": 33782000.0,
                "cost_micros": "337820000",
                "ad_group_ad_id": "673977035663",
                "ad_headlines": [
                    "Internet bina shuruaati kharch",
                    "Ghar ka unlimited internet",
                    "Download karo aur book karo",
                    "YouTube video dekhein din raat",
                    "India ke matches enjoy karein",
                ],
                "ad_id": "673977035663",
                "device": "MOBILE",
                "ad_network_type": "SEARCH",
                "date": datetime(2023, 11, 11, 0, 0),
            }
        ]

        self.mock_df = pd.DataFrame(self.mock_data)

    def test_process_dataframe(self):
        result = self.processor.process_dataframe(self.mock_df.copy())

        # Assertions
        assert len(result) == len(self.mock_df)
        assert "date" in result.columns
        assert isinstance(result["date"][0], datetime)
        numeric_cols = [
            "impressions",
            "clicks",
            "interactions",
            "cost_micros",
            "average_cpm",
            "average_cpc",
            "average_cpv",
            "average_cpe",
            "average_cost",
            "ctr",
        ]

        for col in numeric_cols:
            assert pd.api.types.is_numeric_dtype(result[col])

    def test_process(self):
        result = self.processor.process(self.mock_data)

        assert len(result) == len(self.mock_df)
        assert "date" in result.columns
        assert isinstance(result["date"][0], datetime)
