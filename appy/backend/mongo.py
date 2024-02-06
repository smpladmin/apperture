import os
import motor
from beanie import init_beanie

from domain.chat.models import ChatSettings, Chat
from settings import appy_settings


class Mongo:
    async def init(self):
        self.settings = appy_settings()
        self.client = motor.motor_asyncio.AsyncIOMotorClient(self.settings.db_uri)
        await init_beanie(
            database=self.client[self.settings.db_name],
            document_models=[ChatSettings, Chat],
        )

    async def close(self):
        self.client.close()
