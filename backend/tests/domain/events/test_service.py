from unittest.mock import MagicMock

import pytest
from domain.events.service import EventsService


class TestEventsService:
    @pytest.mark.asyncio
    async def test_update_events(self):
        clickhouse = MagicMock()
        clickhouse.client = MagicMock()
        clickhouse.client.insert = MagicMock()
        events_service = EventsService(clickhouse)
        events = [
            (
                "6371f9866a973281da905ffb",
                "2022-11-15 00:58:03",
                "amplitude",
                "510379",
                "login",
                {"test": "test1"},
            ),
            (
                "6371f9866a973281da905ffb",
                "2022-11-15 00:58:04",
                "amplitude",
                "510379",
                "upload_file_bottom_sheet_viewed",
                {"test": "test2"},
            ),
        ]

        await events_service.update_events(events)

        clickhouse.client.insert.assert_called_once_with(
            "events",
            events,
            column_names=[
                "datasource_id",
                "timestamp",
                "provider",
                "user_id",
                "event_name",
                "properties",
            ],
        )
