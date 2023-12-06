import pandas as pd
from unittest.mock import MagicMock, patch
from store.google_ads_data_saver import GoogleAdsDataSaver

from domain.datasource.models import (
    ClickHouseRemoteConnectionCred,
)


class TestGoogleAdsDataSaver:
    def setup_method(self):
        self.app_id = "test_app_id"
        self.mock_credentials = ClickHouseRemoteConnectionCred(
            username="user", password="pass", host="localhost", port=9000
        )

    def test_convert_header_to_attribute(self):
        with patch(
            "store.clickhouse_client_factory.ClickHouseClientFactory.get_client"
        ) as mock_client:
            mock_client.connection.return_value = MagicMock()

            data_saver = GoogleAdsDataSaver(self.app_id, self.mock_credentials)

            headers = ["date", "impressions", "ad_headlines"]
            expected_result = (
                "date datetime, impressions Int64, ad_headlines Array(String)"
            )

            result = data_saver.convert_header_to_attribute(headers)
            assert result == expected_result

    def test_create_table(self):
        with patch(
            "store.clickhouse_client_factory.ClickHouseClientFactory.get_client"
        ) as mock_client:
            mock_client.connection.return_value = MagicMock()

            data_saver = GoogleAdsDataSaver(self.app_id, self.mock_credentials)

            table_name = "test_table"
            column_names = ["date", "impressions", "ad_headlines"]
            database_name = "test_db"
            expected_query = "CREATE TABLE IF NOT EXISTS test_db.test_table (date datetime, impressions Int64, ad_headlines Array(String)) ENGINE = MergeTree ORDER BY date"

            with patch.object(data_saver.client, "query") as mock_query:
                data_saver.create_table(table_name, column_names, database_name)
                mock_query.assert_called_once_with(expected_query)

    def test_save(self):
        with patch(
            "store.clickhouse_client_factory.ClickHouseClientFactory.get_client"
        ) as mock_client:
            mock_client.connection.return_value = MagicMock()

            data_saver = GoogleAdsDataSaver(self.app_id, self.mock_credentials)

            test_data = {
                "date": ["2023-11-01"],
                "impressions": [100],
                "ad_headlines": ["headline1"],
            }
            df = pd.DataFrame(test_data)
            table_name = "test_table"
            database_name = "test_db"

            with patch.object(data_saver.client, "insert") as mock_insert:
                data_saver.save(df, table_name, database_name)
                mock_insert.assert_called_once_with(
                    data=[["2023-11-01", 100, "headline1"]],
                    table="test_table",
                    database="test_db",
                    column_names=["date", "impressions", "ad_headlines"],
                )
