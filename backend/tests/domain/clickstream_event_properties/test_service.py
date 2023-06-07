from collections import namedtuple
from unittest.mock import MagicMock, AsyncMock, ANY

import pytest

from domain.clickstream_event_properties.models import ClickStreamEventProperties
from domain.clickstream_event_properties.service import (
    ClickStreamEventPropertiesService,
)
from rest.dtos.clickstream_event_properties import ClickStreamEventPropertiesDto


class TestClickStreamEventPropertiesService:
    def setup_method(self):
        ClickStreamEventProperties.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.service = ClickStreamEventPropertiesService(mongo=self.mongo)

        FindOneMock = namedtuple("FindOneMock", ["upsert"])
        ClickStreamEventProperties.event = MagicMock()
        ClickStreamEventProperties.properties = MagicMock()
        ClickStreamEventProperties.updated_at = MagicMock()
        ClickStreamEventProperties.find_one = MagicMock(
            return_value=FindOneMock(
                upsert=AsyncMock(),
            ),
        )
        FindMock = namedtuple("FindMock", ["to_list"])
        ClickStreamEventProperties.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )

    @pytest.mark.asyncio
    async def test_update_event_properties(self):
        res = await self.service.update_event_properties(
            event_properties=ClickStreamEventPropertiesDto(
                event="$autocapture",
                properties=["prop1", "prop2", "prop3"],
            ),
        )
        assert res.dict() == {
            "created_at": ANY,
            "event": "$autocapture",
            "id": None,
            "properties": [
                {"name": "prop1", "type": "default"},
                {"name": "prop2", "type": "default"},
                {"name": "prop3", "type": "default"},
            ],
            "revision_id": None,
            "updated_at": None,
        }

    @pytest.mark.asyncio
    async def test_get_event_properties(self):
        self.service.create_events_map = MagicMock()
        await self.service.get_event_properties()
        ClickStreamEventProperties.find.assert_called_once()
