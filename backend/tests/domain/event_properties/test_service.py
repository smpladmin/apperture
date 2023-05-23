from collections import namedtuple
from unittest.mock import MagicMock, AsyncMock, ANY

import pytest
from beanie import PydanticObjectId

from domain.common.models import IntegrationProvider
from domain.event_properties.models import EventProperties
from domain.event_properties.service import EventPropertiesService
from rest.dtos.event_properties import EventPropertiesDto


class TestEventPropertiesService:
    def setup_method(self):
        EventProperties.get_settings = MagicMock()
        self.mongo = MagicMock()
        self.event_properties_service = EventPropertiesService(mongo=self.mongo)
        self.ds_id = "646b0353b152f734f80d6d3b"
        FindOneMock = namedtuple("FindOneMock", ["upsert"])

        EventProperties.datasource_id = MagicMock()
        EventProperties.event = MagicMock()
        EventProperties.properties = MagicMock()
        EventProperties.updated_at = MagicMock()
        EventProperties.find_one = MagicMock(
            return_value=FindOneMock(
                upsert=AsyncMock(),
            ),
        )

    @pytest.mark.asyncio
    async def test_update_event_properties(self):
        res = await self.event_properties_service.update_event_properties(
            datasource_id=self.ds_id,
            event_properties=EventPropertiesDto(
                event="event1",
                properties=["prop1", "prop2", "prop3"],
                provider="mixpanel",
            ),
        )
        assert res.dict() == {
            "created_at": ANY,
            "datasource_id": PydanticObjectId("646b0353b152f734f80d6d3b"),
            "event": "event1",
            "id": None,
            "properties": [
                {"name": "prop1", "type": "string"},
                {"name": "prop2", "type": "string"},
                {"name": "prop3", "type": "string"},
            ],
            "provider": IntegrationProvider.MIXPANEL,
            "revision_id": None,
            "updated_at": None,
        }
