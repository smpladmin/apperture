from unittest.mock import MagicMock

import pytest
from domain.edge.models import Node
from domain.events.service import EventsService


class TestEventsService:
    def setup_method(self):
        self.clickhouse = MagicMock()
        self.clickhouse.client = MagicMock()
        self.clickhouse.client.insert = MagicMock()
        self.events_repo = MagicMock()
        self.events_service = EventsService(self.clickhouse, self.events_repo)

    @pytest.mark.asyncio
    async def test_update_events(self):
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

        await self.events_service.update_events(events)

        self.clickhouse.client.insert.assert_called_once_with(
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

    @pytest.mark.asyncio
    async def test_get_unique_nodes(self):
        """
        should fetch unique events from repository and convert and return them as nodes
        """
        events = [
            ["otp_sent"],
            ["otp_received"],
            ["otp_entered"],
        ]
        ds_id = "mock-ds-id"
        self.events_repo.get_unique_events.return_value = events

        nodes = await self.events_service.get_unique_nodes(ds_id)

        self.events_repo.get_unique_events.assert_called_once_with(ds_id)
        assert nodes == [
            Node(id="otp_sent", name="otp_sent"),
            Node(id="otp_received", name="otp_received"),
            Node(id="otp_entered", name="otp_entered"),
        ]
