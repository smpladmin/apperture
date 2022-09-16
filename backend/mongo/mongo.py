from beanie import init_beanie
import motor, os

from domain.apps.models import App
from domain.datasources.models import DataSource
from domain.edge.models import Edge
from domain.integrations.models import Integration
from domain.users.models import User
from domain.runlogs.models import RunLog


class Mongo:
    async def init(self):
        self.client = motor.motor_asyncio.AsyncIOMotorClient(os.environ.get("DB_URI"))
        await init_beanie(
            database=self.client[os.environ.get("DB_NAME")],
            document_models=[User, App, Integration, DataSource, Edge, RunLog],
        )

    async def close(self):
        self.client.close()
