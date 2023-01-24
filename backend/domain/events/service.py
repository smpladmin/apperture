from typing import List
import numpy as np
from fastapi import Depends
from clickhouse.clickhouse import Clickhouse
from domain.edge.models import Node
from repositories.clickhouse.events import Events
from domain.events.models import Event


class EventsService:
    def __init__(
        self,
        clickhouse: Clickhouse = Depends(),
        events: Events = Depends(),
    ):
        self.clickhouse = clickhouse.client
        self.events = events
        self.table = "events"
        self.columns = [
            "datasource_id",
            "timestamp",
            "provider",
            "user_id",
            "event_name",
            "properties",
        ]

    async def update_events(self, events):
        self.clickhouse.insert(
            self.table,
            events,
            column_names=self.columns,
        )

    async def get_unique_nodes(self, datasource_id: str):
        events = self.events.get_unique_events(datasource_id)
        return [Node(id=e, name=e) for [e] in events]

    def get_values_for_property(
        self, datasource_id: str, event_property: str, start_date: str, end_date: str
    ):
        return self.events.get_values_for_property(
            datasource_id=datasource_id,
            event_property=event_property,
            start_date=start_date,
            end_date=end_date,
        )

    def get_events(self, datasource_id: str) -> List[Event]:
        events = self.events.get_events(datasource_id=datasource_id)
        return [
            Event(name=name, timestamp=timestamp, user_id=user_id, provider=provider)
            for (name, timestamp, user_id, provider) in events
        ]
