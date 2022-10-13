from smart_open import open as sopen

from domain.datasource.models import Credential
from domain.common.models import DataFormat
from .event_fetcher import event_fetcher

class AmplitudeEventsFetcher(event_fetcher):
    def __init__(self, credential: Credential, date: str,data_format: DataFormat):
        url = "data.mixpanel.com/api/2.0/export" 
        event_fetcher.__init__(self, url, credential, date,data_format)