from typing import Union

from fastapi import Depends

from clickhouse.clickhouse import Clickhouse
from domain.datasources.models import DataSource
from domain.edge.models import Node
from domain.events.models import (
    AuxTable1Event,
    AuxTable2Event,
    Event,
    PaginatedEventsData,
)
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

    async def get_unique_events(self, datasource: DataSource):
        events = await self.events.get_unique_events(
            datasource_id=str(datasource.id), app_id=str(datasource.app_id)
        )
        return events

    def get_values_for_property(
        self, datasource_id: str, event_property: str, start_date: str, end_date: str
    ):
        return self.events.get_values_for_property(
            datasource_id=datasource_id,
            event_property=event_property,
            start_date=start_date,
            end_date=end_date,
        )

    async def get_events(
        self,
        datasource_id: str,
        is_aux: bool,
        table_name: str,
        user_id: Union[str, None],
        page_number: int,
        page_size: int,
        app_id: str,
    ) -> PaginatedEventsData:
        if is_aux:
            events = await self.events.get_aux_events(
                app_id=app_id, datasource_id=datasource_id, table_name=table_name
            )
            count = len(events)
            events = events[:100] if len(events) > 100 else events
            data = (
                [
                    AuxTable1Event(name=name, timestamp=timestamp, user_id=user_id)
                    for (user_id, name, timestamp) in events
                ]
                if table_name == "Backend CRM"
                else [
                    AuxTable2Event(user_id=user_id, salary_basic=salary_basic)
                    for (user_id, salary_basic) in events
                ]
            )
        else:
            events = await self.events.get_events(
                app_id=app_id,
                datasource_id=datasource_id,
                user_id=user_id,
                page_number=page_number,
                page_size=page_size,
            )
            ((count,),) = await self.events.get_events_count(
                app_id=app_id, datasource_id=datasource_id, user_id=user_id
            )
            data = (
                [Event(name=name, timestamp=timestamp) for (name, timestamp) in events]
                if user_id
                else [
                    Event(name=name, timestamp=timestamp, user_id=user_id, city=city)
                    for (name, timestamp, user_id, city) in events
                ]
            )
            page_number = page_number + 1 if user_id else 0

        return PaginatedEventsData(count=count, data=data, page_number=page_number)
