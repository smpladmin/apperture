from typing import List

from beanie import PydanticObjectId
from beanie.operators import In, Or
from .models import App
from ..apperture_users.models import AppertureUser


class AppService:
    async def create_app(self, name: str, user: AppertureUser) -> App:
        app = App(name=name, user_id=user.id)
        await app.insert()
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
