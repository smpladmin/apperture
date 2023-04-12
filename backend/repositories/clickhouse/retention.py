from fastapi import Depends

from clickhouse import Clickhouse
from repositories.clickhouse.base import EventsBase


class Retention(EventsBase):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        super().__init__(clickhouse=clickhouse)
