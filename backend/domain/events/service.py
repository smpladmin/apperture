from fastapi import Depends
from clickhouse.clickhouse import Clickhouse


class EventsService:
    def __init__(self, clickhouse: Clickhouse = Depends()):
        self.clickhouse = clickhouse.client
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
            [list(event.dict().values()) for event in events],
            column_names=self.columns,
        )
