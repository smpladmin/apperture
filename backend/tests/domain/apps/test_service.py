from unittest.mock import AsyncMock, MagicMock
from beanie import PydanticObjectId

import pytest
from domain.apps.models import App
from domain.apps.service import AppService
from domain.users.models import User


class TestAppService:
    @pytest.mark.asyncio
    async def test_share_app(self):
        service = AppService()
        User.get_settings = MagicMock()
        App.get_settings = MagicMock()
        app = AsyncMock()
        old_shared_user_id = str(PydanticObjectId())
        app.shared_with = set([old_shared_user_id])
        App.find_one = AsyncMock(return_value=app)
        App.id = MagicMock()
        App.user_id = MagicMock()
        app_id = str(PydanticObjectId())
        owner_id = str(PydanticObjectId())
        user = User(
            id=PydanticObjectId(),
            first_name="mock",
            last_name="mock",
            email="test@email.com",
            picture="",
        )

        app = await service.share_app(app_id, owner_id, user)

        App.find_one.assert_awaited_once()
        assert app.shared_with == set([old_shared_user_id, user.id])
        app.save.assert_awaited_once()
