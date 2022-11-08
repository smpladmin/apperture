from domain.common.models import DataFormat
from domain.datasource.models import Credential

from .event_fetcher import EventFetcher


class AmplitudeEventsFetcher(EventFetcher):
    def __init__(self, credential: Credential, date: str, data_format: DataFormat):
        self.date = date.replace("-", "")
        self.url = "amplitude.com/api/2/export"
        data_url = f"https://{credential.api_key}:{credential.secret}@{self.url}?start={self.date}T00&end={self.date}T23"
        super().__init__(data_url, data_format)
