import re
from typing import List

from beanie import PydanticObjectId
from beanie.operators import In, Or
from fastapi import Depends

from repositories.clickhouse.clickhouse_role import ClickHouseRole

from ..apperture_users.models import AppertureUser
from .models import App, ClickHouseCredential
from ..common.random_string_utils import StringUtils


class AppService:
    def __init__(
        self,
        clickhouse_role: ClickHouseRole = Depends(),
        string_utils: StringUtils = Depends(),
    ) -> None:
        self.clickhouse_role = clickhouse_role
        self.string_utils = string_utils

    def parse_app_name_to_db_name(self, app_name: str):
        return re.sub("[^A-Za-z0-9]", "_", app_name).lower()

    async def get_app_count_by_database_name(self, name: str):
        database_name = self.parse_app_name_to_db_name(app_name=name)
        return await App.find(
            App.clickhouse_credential.databasename == database_name,
            App.enabled != False,
        ).count()

    def create_app_database(
        self,
        app_name: str,
        username: str,
    ):
        database_name = self.parse_app_name_to_db_name(app_name=app_name)
        self.clickhouse_role.create_database_for_app(database_name=database_name)
        self.clickhouse_role.grant_permission_to_database(
            database_name=database_name, username=username
        )

    async def create_clickhouse_user(
        self, id: PydanticObjectId, app_name: str
    ) -> ClickHouseCredential:
        username = self.string_utils.generate_random_value(16) + str(id)
        password = self.string_utils.generate_random_value()
        database_name = self.parse_app_name_to_db_name(app_name=app_name)

        self.clickhouse_role.create_user(username=username, password=password)
        self.clickhouse_role.grant_select_permission_to_user(username=username)

        self.create_app_database(app_name=app_name, username=username)

        await App.find(App.id == PydanticObjectId(id), App.enabled == True,).update(
            {
                "$set": {
                    "clickhouse_credential": ClickHouseCredential(
                        username=username, password=password, databasename=database_name
                    )
                }
            }
        )

        return ClickHouseCredential(
            username=username, password=password, databasename=database_name
        )

    async def create_app(
        self,
        name: str,
        user: AppertureUser,
    ) -> App:
        app = App(name=name, user_id=user.id)
        await app.insert()
        await self.create_clickhouse_user(id=app.id, app_name=name)
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
