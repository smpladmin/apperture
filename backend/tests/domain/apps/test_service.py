from collections import namedtuple
import string

from unittest.mock import AsyncMock, MagicMock
from beanie import PydanticObjectId

import pytest
from domain.apps.models import App
from domain.apps.service import AppService
from domain.apperture_users.models import AppertureUser


class TestAppService:
    def setup_method(self):
        App.get_settings = MagicMock()
        self.clickhouse_role = MagicMock()
        self.service = AppService(clickhouse_role=self.clickhouse_role)
        self.ds_id = "636a1c61d715ca6baae65611"
        self.username = "test_user"
        self.password = "test_password"
        App.id = MagicMock(return_value=self.ds_id)
        App.enabled = MagicMock(return_value=True)
        FindMock = namedtuple("FindMock", ["update"])
        App.find = MagicMock(
            return_value=FindMock(
                update=AsyncMock(),
            ),
        )
        self.clickhouse_role.create_user = MagicMock()
        self.clickhouse_role.grant_select_permission_to_user = MagicMock()

    @pytest.mark.asyncio
    async def test_share_app(self):
        service = AppService()
        AppertureUser.get_settings = MagicMock()
        App.get_settings = MagicMock()
        app = AsyncMock()
        old_shared_user_id = str(PydanticObjectId())
        app.shared_with = set([old_shared_user_id])
        App.find_one = AsyncMock(return_value=app)
        App.id = MagicMock()
        App.user_id = MagicMock()
        app_id = str(PydanticObjectId())
        owner_id = str(PydanticObjectId())
        user = AppertureUser(
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

    def test_default_length_for_random_value_generator(self):
        password = self.service.generate_random_value()
        assert len(password) == 32

    def test_custom_length_for_random_value_generator(self):
        password = self.service.generate_random_value(length=16)
        assert len(password) == 16

    def test_password_characters_for_random_value_generator(self):
        password = self.service.generate_random_value()
        assert all(c in string.ascii_letters + string.digits for c in password)
