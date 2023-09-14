from strategies.clevertap_events_strategy import ClevertapEventsStrategy
from fetch.clevertap_events_fetcher import ClevertapEventsFetcher
from unittest.mock import MagicMock
from tests.fetch.clevertap_sample import (
    response as fetch_mock_response,
    cursor_response as fetch_mock_cursor_response,
)
from domain.datasource.models import (
    DataSource,
    IntegrationProvider,
    DataSourceVersion,
    Credential,
    CredentialType,
)


class TestClevertapEventsStrategy:
    def setup_method(self):
        self.datasource = DataSource(
            _id="637d1908bda58637558ac303",
            provider=IntegrationProvider.CLEVERTAP,
            name="Mocking strategy",
            externalSourceId="637d27c6bda58637558ac30c",
            version=DataSourceVersion.DEFAULT,
        )

        self.credential = Credential(
            type=CredentialType.API_KEY,
            accountId="3R1-AB2-XD1Z",
            secret="12312cacac1212312ca",
        )
        self.strategy = ClevertapEventsStrategy(
            self.datasource, self.credential, "637d27c6bda58637558ac30c", "20221122"
        )
        self.strategy.fetcher = ClevertapEventsFetcher(self.credential, "20221122")
        self.strategy.fetcher.get_start_cursor = MagicMock(
            return_value=fetch_mock_cursor_response
        )
        self.strategy.fetcher.open = MagicMock(return_value=fetch_mock_response)

        self.strategy.runlog_service = MagicMock()
        self.strategy.saver = MagicMock()

        self.strategy.event_processor = MagicMock()
        self.strategy.properties_saver = MagicMock()
        self.strategy.get_events = MagicMock(return_value=[])

    def test_execute(self):
        self.strategy.execute()
        assert self.strategy.runlog_service.update_started.called
        assert self.strategy.fetcher.open.called
        assert self.strategy.fetcher.get_start_cursor.called
        assert self.strategy.event_processor.process.called
        assert self.strategy.saver.save.called
        assert self.strategy.properties_saver.save.called
