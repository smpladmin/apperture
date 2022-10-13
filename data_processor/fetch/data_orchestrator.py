from domain.common.models import DataFormat

class DataOrchestrator:
    def __init__(self, fetcher, events_saver,data_format:DataFormat):
        self.fetcher = fetcher
        self.events_saver = events_saver
        self.data_format=data_format

    def orchestrate(self):
        events_data = b"" if self.data_type == DataFormat.BINARY else ""
        with self.fetcher.open() as source:
            with self.events_saver.open() as dest:
                for data in source:
                    dest.write(data.encode())
                    events_data += data

        return events_data
