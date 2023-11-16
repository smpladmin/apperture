from unittest.mock import MagicMock

from fetch.clevertap_events_fetcher import ClevertapEventsFetcher
from .clevertap_sample import response, cursor_response
from domain.datasource.models import Credential, CredentialType


class TestClevertapEventsFetcher:
    def setup_method(self):
        self.mock_response = response
        self.mock_cursor_response = cursor_response
        self.credential = Credential(
            type=CredentialType.API_KEY,
            accountId="3R1-AB2-XD1Z",
            secret="12312cacac1212312ca",
            refreshToken=None,
            apiKey=None,
            tableName=None,
            apiBaseUrl=None,
            branchCredential=None,
        )
        self.event = "UTM Visited"

    def test_daily_data(self):
        self.fetcher = ClevertapEventsFetcher(self.credential, "20221122")

        self.fetcher.get_start_cursor = MagicMock(
            return_value=self.mock_cursor_response
        )
        self.fetcher.open = MagicMock(return_value=self.mock_response)

        for result in self.fetcher.fetch(self.event):
            if result:
                assert set(["profile", "session_props", "ts", "event_props"]).issubset(
                    set(result[0].keys())
                )
