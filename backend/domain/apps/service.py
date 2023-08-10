import asyncio
import logging
import re
from typing import List, Union

from beanie import PydanticObjectId
from fastapi import Depends

from repositories.clickhouse.clickhouse_role import ClickHouseRole
from settings import apperture_settings
from utils.mail import GENERIC_EMAIL_DOMAINS

from ..apperture_users.models import AppertureUser
from .models import App, ClickHouseCredential, OrgAccess
from ..common.random_string_utils import StringUtils


class AppService:
    def __init__(
        self,
        clickhouse_role: ClickHouseRole = Depends(),
        string_utils: StringUtils = Depends(),
        settings=apperture_settings(),
    ) -> None:
        self.clickhouse_role = clickhouse_role
        self.string_utils = string_utils
        self.settings = settings

    def parse_app_name_to_db_name(self, app_name: str):
        return re.sub("[^A-Za-z0-9]", "_", app_name).lower()

    async def get_app_count_by_database_name(self, name: str):
        database_name = self.parse_app_name_to_db_name(app_name=name)
        return await App.find(
            App.clickhouse_credential.databasename == database_name,
            App.enabled != False,
        ).count()

    async def get_app_count(self, user_id: PydanticObjectId):
        return await App.find(App.user_id == user_id).count()

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

        creds = ClickHouseCredential(
            username=username, password=password, databasename=database_name
        )

        await App.find(
            App.id == PydanticObjectId(id),
            App.enabled == True,
        ).update({"$set": {"clickhouse_credential": creds}})

        return creds

    def parse_domain_from_email(self, email: str) -> Union[str, None]:
        try:
            domain = email.split("@")[-1]
            if domain not in GENERIC_EMAIL_DOMAINS:
                return domain
            return None
        except Exception as e:
            logging.info(f"Exception while parsing domain from email: {e}")
            return None

    async def create_app(
        self,
        name: str,
        user: AppertureUser,
    ) -> App:
        app = App(name=name, user_id=user.id)
        app.domain = self.parse_domain_from_email(email=user.email)
        await app.insert()
        creds = await self.create_clickhouse_user(id=app.id, app_name=name)
        app.clickhouse_credential = creds
        return app

    async def get_apps(self, user: AppertureUser) -> List[App]:
        return await App.find(
            {
                "enabled": True,
                "$or": [
                    {
                        "$or": [
                            {"user_id": user.id},
                            {"shared_with": {"$in": [user.id]}},
                        ],
                    },
                    {
                        "$and": [
                            {"org_access": True},
                            {"domain": self.parse_domain_from_email(email=user.email)},
                        ],
                    },
                ],
            }
        ).to_list()

    async def get_app(self, id: str) -> App:
        return await App.get(id)

    async def get_user_app(self, id: str, user_id: str) -> App:
        return await App.find_one(
            App.id == PydanticObjectId(id),
            App.user_id == PydanticObjectId(user_id),
        )

    async def get_shared_or_owned_app(self, id: str, user: AppertureUser) -> App:
        return await App.find_one(
            {
                "_id": PydanticObjectId(id),
                "$or": [
                    {
                        "$or": [
                            {"user_id": user.id},
                            {"shared_with": {"$in": [user.id]}},
                        ],
                    },
                    {
                        "$and": [
                            {"org_access": True},
                            {"domain": self.parse_domain_from_email(email=user.email)},
                        ],
                    },
                ],
            }
        )

    async def share_app(
        self, id: str, owner_id: str, to_share_with: List[PydanticObjectId]
    ):
        app = await self.get_user_app(id, owner_id)
        for user_id in to_share_with:
            app.shared_with.add(user_id)
        await app.save()
        return app

    async def switch_org_access(self, id: str, org_access: bool):
        app = await self.get_app(id)
        app.org_access = org_access
        await app.save()
        return app

    async def get_users_for_app(self, app_id: str):
        app = await App.get(PydanticObjectId(app_id))
        return [app.user_id] + [user_id for user_id in app.shared_with]

    async def get_user_domain(self, app_id: str):
        app = await App.get(PydanticObjectId(app_id))
        return OrgAccess(org_access=app.org_access, domain=app.domain)

    async def is_valid_user_for_app(self, app_id: str, user: AppertureUser):
        app_users, app_domain = await asyncio.gather(
            self.get_users_for_app(app_id=app_id), self.get_user_domain(app_id=app_id)
        )

        if user.id in app_users:
            return True

        user_email_domain = self.parse_domain_from_email(email=user.email)
        if app_domain.org_access and user_email_domain == app_domain.domain:
            return True

        return False
