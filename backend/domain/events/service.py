from typing import List
import numpy as np
from fastapi import Depends
from clickhouse.clickhouse import Clickhouse
from domain.datasources.models import DataSource
from domain.edge.models import Node
from repositories.clickhouse.events import Events


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

    async def get_unique_nodes(self, datasource: DataSource):
        events = self.events.get_unique_events(str(datasource.id))
        return [Node(id=e, name=e, provider=datasource.provider) for [e] in events]

    def get_values_for_property(
        self, datasource_id: str, event_property: str, start_date: str, end_date: str
    ):
        return self.events.get_values_for_property(
            datasource_id=datasource_id,
            event_property=event_property,
            start_date=start_date,
            end_date=end_date,
        )
