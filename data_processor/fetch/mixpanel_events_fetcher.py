from domain.common.models import DataFormat
from domain.datasource.models import Credential

from .event_fetcher import EventFetcher


class MixpanelEventsFetcher(EventFetcher):
    def __init__(self, credential: Credential, date: str, data_format: DataFormat):
        self.url = "data.mixpanel.com/api/2.0/export"
        data_url = f"https://{credential.api_key}:{credential.secret}@{self.url}?from_date={date}&to_date={date}&project_id={credential.account_id}"
        super().__init__(data_url, data_format)
