from beanie import init_beanie
import motor, os
from domain.apps.models import App
from domain.users.models import User


class Mongo:
    async def init(self):
        self.client = motor.motor_asyncio.AsyncIOMotorClient(os.environ.get("DB_URI"))
        await init_beanie(
            database=self.client[os.environ.get("DB_NAME")], document_models=[User, App]
        )

    async def close(self):
        self.client.close()
