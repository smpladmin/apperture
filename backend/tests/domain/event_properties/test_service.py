from collections import namedtuple
from unittest.mock import MagicMock, AsyncMock, ANY

import pytest
import datetime
from beanie import PydanticObjectId

from domain.common.models import IntegrationProvider, Property
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
        EventProperties.provider = MagicMock()
        EventProperties.updated_at = MagicMock()
        EventProperties.find_one = MagicMock(
            return_value=FindOneMock(
                upsert=AsyncMock(),
            ),
        )
        FindMock = namedtuple("FindMock", ["to_list"])
        EventProperties.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
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
                {"name": "prop1", "type": "default"},
                {"name": "prop2", "type": "default"},
                {"name": "prop3", "type": "default"},
            ],
            "provider": IntegrationProvider.MIXPANEL,
            "revision_id": None,
            "updated_at": None,
        }

    @pytest.mark.asyncio
    async def test_get_event_properties(self):
        self.event_properties_service.create_events_map = MagicMock()
        await self.event_properties_service.get_event_properties()
        EventProperties.find.assert_called_once()
        self.event_properties_service.create_events_map.assert_called_once()

    def test_create_events_map(self):
        event_properties = [
            EventProperties(
                id=PydanticObjectId("646ca1de617e89d4347d9534"),
                revision_id=None,
                created_at=datetime.datetime(2023, 5, 23, 11, 22, 6, 888000),
                updated_at=datetime.datetime(2023, 5, 25, 5, 28, 4, 421000),
                datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e94"),
                event="test",
                properties=[
                    Property(name="prop1", type="default"),
                    Property(name="prop4", type="default"),
                    Property(name="prop3", type="default"),
                ],
                provider=IntegrationProvider.APPERTURE,
            ),
            EventProperties(
                id=PydanticObjectId("646ca1de617e89d4347d9555"),
                revision_id=None,
                created_at=datetime.datetime(2023, 5, 23, 11, 22, 6, 888000),
                updated_at=datetime.datetime(2023, 5, 23, 11, 55, 46, 846000),
                datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e84"),
                event="test",
                properties=[
                    Property(name="prop1", type="string"),
                    Property(name="prop4", type="string"),
                    Property(name="prop3", type="string"),
                ],
                provider=IntegrationProvider.APPERTURE,
            ),
            EventProperties(
                id=PydanticObjectId("646ca1de617e89d4347d9599"),
                revision_id=None,
                created_at=datetime.datetime(2023, 5, 23, 11, 22, 6, 888000),
                updated_at=datetime.datetime(2023, 5, 23, 11, 55, 46, 846000),
                datasource_id=PydanticObjectId("63ce4906f496f7b462ab7e94"),
                event="test2",
                properties=[
                    Property(name="prop1", type="string"),
                    Property(name="prop4", type="string"),
                    Property(name="prop3", type="string"),
                ],
                provider=IntegrationProvider.APPERTURE,
            ),
        ]
        assert self.event_properties_service.create_events_map(
            event_properties=event_properties
        ) == {
            "63ce4906f496f7b462ab7e84": {"test": ["prop1", "prop4", "prop3"]},
            "63ce4906f496f7b462ab7e94": {
                "test": ["prop1", "prop4", "prop3"],
                "test2": ["prop1", "prop4", "prop3"],
            },
        }
