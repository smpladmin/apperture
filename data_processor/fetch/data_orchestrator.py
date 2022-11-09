from domain.common.models import DataFormat


class DataOrchestrator:
    def __init__(self, fetcher, data_format: DataFormat):
        self.fetcher = fetcher
        self.data_format = data_format

    def orchestrate(self):
        events_data = b"" if self.data_format == DataFormat.BINARY else ""
        with self.fetcher.open() as source:
            for data in source:
                events_data += data

        return events_data
