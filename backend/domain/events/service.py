from typing import List
import numpy as np
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

    def validate_properties(self, all_props: List[str], date: str, ds_id: str):
        value_counts = np.array(
            self.events.get_distinct_values_for_properties(
                all_props=all_props, date=date, ds_id=ds_id
            )[0]
        )
        all_props = np.array(all_props)
        return (all_props[value_counts > 1]).tolist()

    def get_event_properties(self, datasource_id: str, chunk_size: int):
        [(all_properties, date)] = self.events.get_event_properties(
            datasource_id=datasource_id
        )

        # StreamingResponse implementation
        # n = len(all_properties)//chunk_size
        # for i in range(1, n+1):
        #     yield self.validate_properties(
        #         all_props=all_properties[(i-1)*chunk_size:i*chunk_size], date=date, ds_id=datasource_id
        #     )
        # yield self.validate_properties(
        #     all_props=all_properties[n*chunk_size:], date=date, ds_id=datasource_id
        # )

        return self.validate_properties(
            all_props=all_properties, date=date, ds_id=datasource_id
        )

    def get_values_for_property(
        self, datasource_id: str, event_property: str, start_date: str, end_date: str
    ):
        return self.events.get_values_for_property(
            datasource_id=datasource_id,
            event_property=event_property,
            start_date=start_date,
            end_date=end_date,
        )
