from typing import List
from .models import App
from ..users.models import User


class AppService:
    async def create_app(self, name: str, user: User) -> App:
        app = App(name=name, user_id=str(user.id))
        await app.insert()
        return app

    async def get_apps(self, user: User) -> List[App]:
        return await App.find(App.user_id == str(user.id)).to_list()

    async def get_app(self, id: str) -> App:
        return await App.get(id)
