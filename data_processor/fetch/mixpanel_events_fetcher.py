from smart_open import open as sopen

from domain.common.models import DataFormat
from domain.datasource.models import Credential

from .event_fetcher import EventFetcher


class MixpanelEventsFetcher(EventFetcher):
    def __init__(self, credential: Credential, date: str, data_format: DataFormat):
        self.url = "data.mixpanel.com/api/2.0/export"
        self.data_url = f"https://{credential.api_key}:{credential.secret}@{self.url}?from_date={date}&to_date={date}&project_id={credential.account_id}"
        EventFetcher.__init__(self, self.data_url, data_format)
