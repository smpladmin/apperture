from typing import List

from beanie import PydanticObjectId
from .models import App
from ..users.models import User


class AppService:
    async def create_app(self, name: str, user: User) -> App:
        app = App(name=name, user_id=user.id)
        await app.insert()
        return app

    async def get_apps(self, user: User) -> List[App]:
        return await App.find(App.user_id == user.id).to_list()

    async def get_user_app(self, id: str, user_id: str) -> App:
        return await App.find_one(
            App.id == PydanticObjectId(id),
            App.user_id == PydanticObjectId(user_id),
        )
