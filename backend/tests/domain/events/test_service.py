from datetime import datetime
from unittest.mock import MagicMock

import pytest
from domain.common.models import IntegrationProvider
from domain.datasources.models import DataSource, DataSourceVersion
from domain.events.models import Event, PaginatedEventsData
from domain.events.service import EventsService


class TestEventsService:
    def setup_method(self):
        self.clickhouse = MagicMock()
        self.clickhouse.client = MagicMock()
        self.clickhouse.client.insert = MagicMock()
        self.events_repo = MagicMock()
        DataSource.get_settings = MagicMock()
        self.events_service = EventsService(self.clickhouse, self.events_repo)
        self.props = ["prop1", "prop2", "prop3", "prop4"]
        self.date = "2022-01-01"
        self.ds_id = "test-id"
        self.datasource = DataSource(
            integration_id="636a1c61d715ca6baae65611",
            app_id="636a1c61d715ca6baae65611",
            user_id="636a1c61d715ca6baae65611",
            provider=IntegrationProvider.MIXPANEL,
            external_source_id="123",
            version=DataSourceVersion.DEFAULT,
        )

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
    async def test_get_unique_events(self):
        """
        should fetch unique events from repository and convert and return them as nodes
        """
        events = [
            ["otp_sent"],
            ["otp_received"],
            ["documents_verified"],
        ]
        self.events_repo.get_unique_events.return_value = events

        events = await self.events_service.get_unique_events(self.datasource)

        self.events_repo.get_unique_events.assert_called_once_with(
            str(self.datasource.id)
        )
        assert events == [["otp_sent"], ["otp_received"], ["documents_verified"]]

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

    def test_get_events(self):
        self.events_repo.get_events.return_value = [
            (
                "Content_Like",
                datetime(2023, 1, 13, 15, 23, 38),
                "mthdas8@gmail.com",
                "Delhi",
            ),
            (
                "WebView_Open",
                datetime(2023, 1, 13, 15, 23, 41),
                "mthdas8@gmail.com",
                "Delhi",
            ),
        ]
        self.events_repo.get_events_count.return_value = ((2,),)

        assert self.events_service.get_events(
            datasource_id=self.ds_id,
            is_aux=False,
            table_name="All",
            user_id=None,
            page_number=0,
            page_size=100,
        ) == PaginatedEventsData(
            count=2,
            page_number=0,
            data=[
                Event(
                    name="Content_Like",
                    timestamp=datetime(2023, 1, 13, 15, 23, 38),
                    user_id="mthdas8@gmail.com",
                    city="Delhi",
                ),
                Event(
                    name="WebView_Open",
                    timestamp=datetime(2023, 1, 13, 15, 23, 41),
                    user_id="mthdas8@gmail.com",
                    city="Delhi",
                ),
            ],
        )

        self.events_repo.get_events.assert_called_once_with(
            **{
                "datasource_id": "test-id",
                "page_number": 0,
                "page_size": 100,
                "user_id": None,
            }
        )

    def test_get_events_for_user_id(self):
        self.events_repo.get_events.return_value = [
            (
                "Content_Like",
                datetime(2023, 1, 13, 15, 23, 38),
            ),
            (
                "WebView_Open",
                datetime(2023, 1, 13, 15, 23, 41),
            ),
        ]
        self.events_repo.get_events_count.return_value = ((2,),)

        assert self.events_service.get_events(
            datasource_id=self.ds_id,
            user_id="test-user",
            page_number=3,
            page_size=100,
            table_name="events",
            is_aux=False,
        ) == PaginatedEventsData(
            count=2,
            page_number=4,
            data=[
                Event(
                    name="Content_Like",
                    timestamp=datetime(2023, 1, 13, 15, 23, 38),
                    user_id=None,
                    city=None,
                ),
                Event(
                    name="WebView_Open",
                    timestamp=datetime(2023, 1, 13, 15, 23, 41),
                    user_id=None,
                    city=None,
                ),
            ],
        )

        self.events_repo.get_events.assert_called_once_with(
            **{
                "datasource_id": "test-id",
                "page_number": 3,
                "page_size": 100,
                "user_id": "test-user",
            }
        )
