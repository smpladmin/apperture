from smart_open import open as sopen
from domain.datasource.models import Credential
from domain.common.models import DataFormat


class event_fetcher:
    def __init__(self,url:str, credential: Credential, date: str,data_format:DataFormat):
        self.url=url
        self.data_format= "rb" if data_format == DataFormat.BINARY else "r"
        self.data_url = f"https://{credential.api_key}:{credential.secret}@{self.url}?from_date={date}&to_date={date}&project_id={credential.account_id}"

    def open(self):
        return sopen(self.data_url,self.data_format)
