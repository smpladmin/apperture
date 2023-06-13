import random
import re
import string
from typing import List

from beanie import PydanticObjectId
from beanie.operators import In, Or
from fastapi import Depends

from repositories.clickhouse.clickhouse_role import ClickHouseRole

from ..apperture_users.models import AppertureUser
from .models import App, ClickHouseCredential


class AppService:
    def __init__(self, clickhouse_role: ClickHouseRole = Depends()) -> None:
        self.clickhouse_role = clickhouse_role

    def generate_random_value(self, length=32):
        characters = string.ascii_letters + string.digits
        password = "".join(random.choice(characters) for _ in range(length))
        return password

    def create_app_database(
        self,
        name: str,
        username: str,
    ):
        database_name = re.sub("[^A-Za-z0-9]", "_", name).lower()
        self.clickhouse_role.create_database_for_app(database_name=database_name)
        self.clickhouse_role.grant_permission_to_database(
            database_name=database_name, username=username
        )

    async def create_clickhouse_user(
        self, id: PydanticObjectId, name: str
    ) -> ClickHouseCredential:
        username = self.generate_random_value(16) + str(id)
        password = self.generate_random_value()
        self.create_app_database(name=name, username=username)
        self.clickhouse_role.create_user(username=username, password=password)
        self.clickhouse_role.grant_select_permission_to_user(username=username)

        await App.find(App.id == PydanticObjectId(id), App.enabled == True,).update(
            {
                "$set": {
                    "clickhouse_credential": ClickHouseCredential(
                        username=username, password=password
                    )
                }
            }
        )

        return ClickHouseCredential(username=username, password=password)

    async def create_app(
        self,
        name: str,
        user: AppertureUser,
    ) -> App:
        app = App(name=name, user_id=user.id)
        await app.insert()
        await self.create_clickhouse_user(id=app.id)
        return app

    async def get_apps(self, user: AppertureUser) -> List[App]:
        return await App.find(
            Or(
                App.user_id == user.id,
                In(App.shared_with, [user.id]),
            ),
            App.enabled == True,
        ).to_list()

    async def get_app(self, id: str) -> App:
        return await App.get(id)

    async def get_user_app(self, id: str, user_id: str) -> App:
        return await App.find_one(
            App.id == PydanticObjectId(id),
            App.user_id == PydanticObjectId(user_id),
        )

    async def share_app(self, id: str, owner_id: str, user: AppertureUser):
        app = await self.get_user_app(id, owner_id)
        app.shared_with.add(user.id)
        await app.save()
        return app
