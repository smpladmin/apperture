import requests
from domain.common.models import DataFormat
from domain.datasource.models import Credential


class MixpanelEventsFetcher:
    def __init__(self, credential: Credential, date: str):
        self.max_buffer_size = 10000
        self.url = "data.mixpanel.com/api/2.0/export"
        self.data_url = f"https://{credential.api_key}:{credential.secret}@{self.url}?from_date={date}&to_date={date}&project_id={credential.account_id}"

    def fetch(self):
        with requests.get(self.data_url, stream=True) as r:
            buffer = []
            for line in r.iter_lines():
                if line:
                    buffer.append(line.decode())
                if len(buffer) == self.max_buffer_size:
                    yield buffer
                    buffer = []
            if buffer:
                yield buffer
