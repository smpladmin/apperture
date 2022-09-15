import logging
from domain.datasource.models import Credential, DataSource
from fetch.mixpanel_events_fetcher import MixpanelEventsFetcher
from store.mixpanel_events_saver import MixpanelEventsSaver


class MixpanelEventsStrategy:
    def __init__(self, datasource: DataSource, credential: Credential, date: str):
        self.datasource = datasource
        self.credential = credential
        self.date = date
        self.fetcher = MixpanelEventsFetcher(credential, date)
        self.saver = MixpanelEventsSaver(credential, date)

    def execute(self):
        with self.fetcher.open() as source:
            with self.saver.open() as dest:
                for data in source:
                    dest.write(data.encode())
        logging.info(
            f"Saved Event Data for Mixpanel datasource, name - {self.datasource.name} id - {self.datasource.id}"
        )
