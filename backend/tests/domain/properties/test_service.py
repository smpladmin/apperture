from collections import namedtuple
from unittest import mock
from unittest.mock import MagicMock, AsyncMock, ANY

import pytest
from beanie import PydanticObjectId

from domain.properties.models import Properties
from domain.properties.service import PropertiesService


class TestPropertiesService:
    def setup_method(self):
        Properties.get_settings = MagicMock()
        self.upsert_mock = AsyncMock()
        FindOneMock = namedtuple("FindOneMock", ["upsert"])
        Properties.find_one = MagicMock(
            return_value=FindOneMock(upsert=self.upsert_mock)
        )
        Properties.updated_at = MagicMock()
        self.mongo = MagicMock()
        self.events = MagicMock()
        self.service = PropertiesService(mongo=self.mongo, events=self.events)
        self.all_props = ["prop1", "prop2", "prop3", "prop4"]
        self.date = "2022-01-01"
        self.ds_id = "637739d383ea7fda83e72a2d"
        Properties.datasource_id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        Properties.properties = MagicMock(return_value=self.all_props)

    def test_validate_properties(self):
        self.events.get_distinct_values_for_properties.return_value = ([1, 5, 13, 1],)
        assert self.service.validate_properties(
            all_props=self.all_props, date=self.date, ds_id=self.ds_id
        ) == ["prop2", "prop3"]
        self.events.get_distinct_values_for_properties.assert_called_once_with(
            **{
                "all_props": self.all_props,
                "date": self.date,
                "ds_id": self.ds_id,
            }
        )

    @pytest.mark.asyncio
    async def test_refresh_properties(self):
        self.events.get_event_properties.return_value = [(self.all_props, self.date)]
        self.events.get_distinct_values_for_properties.return_value = ([1, 5, 13, 1],)
        properties = await self.service.refresh_properties(ds_id=self.ds_id)
        assert properties.dict() == {
            "created_at": ANY,
            "datasource_id": PydanticObjectId(self.ds_id),
            "id": None,
            "properties": [
                {"name": "prop2", "type": "default"},
                {"name": "prop3", "type": "default"},
            ],
            "revision_id": ANY,
            "updated_at": ANY,
        }
        Properties.find_one.assert_called_once()
        assert self.upsert_mock.call_args.kwargs["on_insert"].dict() == {
            "created_at": ANY,
            "datasource_id": PydanticObjectId("637739d383ea7fda83e72a2d"),
            "id": None,
            "properties": [
                {"name": "prop2", "type": "default"},
                {"name": "prop3", "type": "default"},
            ],
            "revision_id": ANY,
            "updated_at": None,
        }

    @pytest.mark.asyncio
    async def test_refresh_properties_for_all_datasources(self):
        self.events.get_all_datasources.return_value = [
            ("637739d383ea7fda83e72a2d",),
            ("637739d383ea7fda83e72a2e",),
        ]
        self.service.refresh_properties = AsyncMock()
        await self.service.refresh_properties_for_all_datasources()
        self.service.refresh_properties.assert_has_calls(
            [
                mock.call(ds_id="637739d383ea7fda83e72a2d"),
                mock.call(ds_id="637739d383ea7fda83e72a2e"),
            ],
            any_order=True,
        )

    @pytest.mark.asyncio
    async def test_fetch_properties(self):
        Properties.find_one = AsyncMock()
        await self.service.fetch_properties(ds_id=self.ds_id)
        Properties.find_one.assert_called_once()
