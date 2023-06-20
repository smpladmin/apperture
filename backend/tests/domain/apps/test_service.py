from collections import namedtuple
import string

from unittest.mock import AsyncMock, MagicMock
from beanie import PydanticObjectId

import pytest
from domain.apps.models import App, ClickHouseCredential
from domain.apps.service import AppService
from domain.apperture_users.models import AppertureUser


class TestAppService:
    def setup_method(self):
        App.get_settings = MagicMock()
        AppertureUser.get_settings = MagicMock()

        self.clickhouse_role = MagicMock()
        self.service = AppService(clickhouse_role=self.clickhouse_role)
        self.ds_id = "636a1c61d715ca6baae65611"
        self.username = "test_user"
        self.password = "test_password"
        self.app_name = "Test App"
        self.id = "636a1c61d715ca6baae65611"
        self.user = AppertureUser(
            id=PydanticObjectId("636a1c61d715ca6baae65611"),
            first_name="mock",
            last_name="mock",
            email="test@email.com",
            picture="",
        )
        App.id = MagicMock(return_value=self.ds_id)
        App.enabled = MagicMock(return_value=True)
        FindMock = namedtuple("FindMock", ["update"])
        App.find = MagicMock(
            return_value=FindMock(
                update=AsyncMock(),
            ),
        )
        App.insert = AsyncMock()
        self.clickhouse_role.create_user = MagicMock()
        self.clickhouse_role.grant_select_permission_to_user = MagicMock()
        self.clickhouse_role.create_database_for_app = MagicMock()
        self.clickhouse_role.grant_permission_to_database = MagicMock()

    @pytest.mark.asyncio
    async def test_share_app(self):
        service = AppService()
        app = AsyncMock()
        old_shared_user_id = str(PydanticObjectId())
        app.shared_with = set([old_shared_user_id])
        App.find_one = AsyncMock(return_value=app)
        App.id = MagicMock()
        App.user_id = MagicMock()
        app_id = str(PydanticObjectId())
        owner_id = str(PydanticObjectId())

        app = await service.share_app(app_id, owner_id, self.user)

        App.find_one.assert_awaited_once()
        assert app.shared_with == set([old_shared_user_id, self.user.id])
        app.save.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_create_app(self):
        self.service.create_clickhouse_user = AsyncMock()
        app = await self.service.create_app(name=self.app_name, user=self.user)

        app.insert.assert_called_once()
        self.service.create_clickhouse_user.assert_called_once_with(
            **{"id": None, "app_name": "Test App"}
        )

    def test_default_length_for_random_value_generator(self):
        password = self.service.generate_random_value()
        assert len(password) == 32

    def test_custom_length_for_random_value_generator(self):
        password = self.service.generate_random_value(length=16)
        assert len(password) == 16

    def test_password_characters_for_random_value_generator(self):
        password = self.service.generate_random_value()
        assert all(c in string.ascii_letters + string.digits for c in password)

    def test_create_app_database(self):
        self.service.create_app_database(app_name=self.app_name, username=self.username)

        self.clickhouse_role.create_database_for_app.assert_called_with(
            **{"database_name": "test_app"}
        )
        self.clickhouse_role.grant_permission_to_database.assert_called_with(
            **{"database_name": "test_app", "username": "test_user"}
        )

    @pytest.mark.asyncio
    async def test_create_clickhouse_user(self):
        self.service.generate_random_value = MagicMock(
            return_value="sdeweiwew33dssdsdds"
        )
        self.service.create_app_database = MagicMock()

        result = await self.service.create_clickhouse_user(
            id=PydanticObjectId(self.id), app_name=self.app_name
        )

        assert result == ClickHouseCredential(
            username="sdeweiwew33dssdsdds636a1c61d715ca6baae65611",
            password="sdeweiwew33dssdsdds",
            databasename="test_app",
        )
        App.find.assert_called_once()
        self.clickhouse_role.create_user.assert_called_with(
            **{
                "username": "sdeweiwew33dssdsdds636a1c61d715ca6baae65611",
                "password": "sdeweiwew33dssdsdds",
            }
        )
        self.clickhouse_role.grant_select_permission_to_user.assert_called_with(
            **{"username": "sdeweiwew33dssdsdds636a1c61d715ca6baae65611"}
        )
        self.service.create_app_database.assert_called_once_with(
            **{
                "app_name": "Test App",
                "username": "sdeweiwew33dssdsdds636a1c61d715ca6baae65611",
            }
        )
