from smart_open import open as sopen

from domain.datasource.models import Credential


class MixpanelEventsFetcher:
    def __init__(self, credential: Credential, date: str):
        url = "data.mixpanel.com/api/2.0/export"
        self.data_url = f"https://{credential.api_key}:{credential.secret}@{url}?from_date={date}&to_date={date}&project_id={credential.account_id}"

    def open(self):
        return sopen(self.data_url)
