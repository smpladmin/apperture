from repositories.clickhouse.base import EventsBase


class Clickstream(EventsBase):
    def __init__(self):
        self.set_table("clickstream")
