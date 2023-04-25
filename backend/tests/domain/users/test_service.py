import json
from domain.users.service import UserService
from unittest.mock import AsyncMock, MagicMock
from domain.users.models import UserDetails
import pytest


class TestUserService:
    def setup_method(self):
        self.user_repo = MagicMock()
        props = {
            "city": "Mumbai",
            "OS": "Androids",
            "country": "India",
            "Browser": "Google Chrome",
        }

        self.properties = [(props,)]
        self.mock_properties = [(json.dumps(props),)]
        self.user_repo.get_user_properties = MagicMock(
            return_value=self.mock_properties
        )
        self.service = UserService(self.user_repo)

    @pytest.mark.asyncio
    async def test_get_user_properties_with_event(self):
        assert await self.service.get_user_properties(
            user_id="user_id", datasource_id="datasource_id", event="Video_Seen"
        ) == UserDetails(
            user_id="user_id",
            datasource_id="datasource_id",
            property=self.properties[0][0],
        )

    @pytest.mark.asyncio
    async def test_get_user_properties_without_events(self):
        assert await self.service.get_user_properties(
            user_id="user_id", datasource_id="datasource_id", event=None
        ) == UserDetails(
            user_id="user_id",
            datasource_id="datasource_id",
            property=self.properties[0][0],
        )
