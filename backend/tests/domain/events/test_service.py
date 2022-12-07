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
        self.props = ["prop1", "prop2", "prop3", "prop4"]
        self.date = "2022-01-01"
        self.ds_id = "test-id"

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

    def test_get_event_properties(self):
        self.events_service.validate_properties = MagicMock(
            return_value=["prop1", "prop3"]
        )
        self.events_repo.get_event_properties.return_value = [(self.props, self.date)]
        assert self.events_service.get_event_properties(
            datasource_id=self.ds_id, chunk_size=50
        ) == ["prop1", "prop3"]
        self.events_service.validate_properties.assert_called_once_with(
            **{
                "all_props": ["prop1", "prop2", "prop3", "prop4"],
                "date": "2022-01-01",
                "ds_id": "test-id",
            }
        )
        self.events_repo.get_event_properties.assert_called_once_with(
            **{"datasource_id": "test-id"}
        )

    def test_validate_properties(self):
        self.events_repo.get_distinct_values_for_properties.return_value = (
            [5, 1, 3, 1],
        )
        assert self.events_service.validate_properties(
            ds_id=self.ds_id, date=self.date, all_props=self.props
        ) == ["prop1", "prop3"]
        self.events_repo.get_distinct_values_for_properties.assert_called_once_with(
            **{
                "all_props": ["prop1", "prop2", "prop3", "prop4"],
                "date": "2022-01-01",
                "ds_id": "test-id",
            }
        )

    def test_get_values_for_property(self):
        self.events_repo.get_values_for_property.return_value = [
            ["Philippines"],
            ["Hong Kong"],
        ]
        assert self.events_service.get_values_for_property(
            datasource_id=self.ds_id,
            event_property="country",
            start_date="1970-01-01",
            end_date="2022-01-01",
        ) == [["Philippines"], ["Hong Kong"]]
        self.events_repo.get_values_for_property.assert_called_once_with(
            **{
                "datasource_id": "test-id",
                "end_date": "2022-01-01",
                "event_property": "country",
                "start_date": "1970-01-01",
            }
        )
