from fastapi import Depends
from clickhouse.clickhouse import Clickhouse
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

    async def get_unique_nodes(self, datasource_id: str):
        events = self.events.get_unique_events(datasource_id)
        return [Node(id=e, name=e) for [e] in events]
