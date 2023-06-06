from fastapi import Depends
from clickhouse.clickhouse import Clickhouse

from abc import ABC


class EventsBase(ABC):
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse

    def createNewRole(self, username, password):
        pass
