from collections import namedtuple
from unittest.mock import AsyncMock, MagicMock
from beanie import PydanticObjectId

import pytest

from domain.apperture_users.models import AppertureUser
from domain.apperture_users.service import AppertureUserService
from utils.errors import BusinessError


class TestUserService:
    def setup_method(self):
        self.service = AppertureUserService()
        self.first_name = "John"
        self.last_name = "Doe"
        self.email = "johndoe@gmail.com"
        self.password = "argon2"
        self.new_password = "argon3"
        self.api_key = "37462-bg372f-ut89m"
        self.user_id = "636a1c61d715ca6baae65611"
        self.ds_id = "636a1c61d715ca6baae65611"
        AppertureUser.id = MagicMock(return_value=PydanticObjectId(self.ds_id))
        AppertureUser.api_key = MagicMock(return_value=self.api_key)
        AppertureUser.get_settings = MagicMock()
        AppertureUser.insert = AsyncMock()
        FindMock = namedtuple("FindMock", ["to_list"])
        AppertureUser.find = MagicMock(
            return_value=FindMock(
                to_list=AsyncMock(),
            ),
        )
        AppertureUser.find_one = AsyncMock()

    @pytest.mark.asyncio
    async def test_create_user_with_password_new_user(self):
        user = await self.service.create_user_with_password(
            self.first_name, self.last_name, self.email, self.password
        )

        assert user.first_name == self.first_name
        assert user.last_name == self.last_name
        assert user.email == self.email
        assert user.password == user.password
        user.insert.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_user_with_password_new_user(self):
        existing_user = MagicMock()
        AppertureUser.email = MagicMock()
        AppertureUser.find_one = AsyncMock(return_value=existing_user)
        with pytest.raises(BusinessError, match="User already exists with this email"):
            user = await self.service.create_user_with_password(
                self.first_name, self.last_name, self.email, self.password
            )

    @pytest.mark.asyncio
    async def test_get_user_by_api_key(self):
        await self.service.get_user_by_api_key(
            api_key=self.api_key,
        )
        AppertureUser.find_one.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_api_key(self):
        FindOneMock = namedtuple("FindOneMock", ["update"])
        self.update_mock = AsyncMock()
        AppertureUser.find_one = MagicMock(
            return_value=FindOneMock(update=self.update_mock)
        )
        await self.service.update_api_key(
            user_id=self.user_id,
            api_key=self.api_key,
        )
        self.update_mock.assert_called_once_with(
            {"$set": {"api_key": "37462-bg372f-ut89m"}}
        )
