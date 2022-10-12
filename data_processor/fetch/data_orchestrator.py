class DataOrchestrator:
    def __init__(self, fetcher, events_saver):
        self.fetcher = fetcher
        self.events_saver = events_saver

    def orchestrate(self):
        events_data = ""
        with self.fetcher.open() as source:
            with self.events_saver.open() as dest:
                for data in source:
                    dest.write(data.encode())
                    events_data += data

        return events_data
