from beanie import init_beanie
import motor, os

from users.models import User


class Mongo:
    async def init(self):
        client = motor.motor_asyncio.AsyncIOMotorClient(os.environ.get("DB_URI"))
        await init_beanie(
            database=client[os.environ.get("DB_NAME")], document_models=[User]
        )
