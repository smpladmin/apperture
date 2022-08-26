from .models import App
from ..users.models import User


class AppService:
    async def create_app(self, name: str, user: User) -> App:
        app = App(name=name, user_id=str(user.id))
        await app.insert()
        return app
