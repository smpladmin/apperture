from beanie import init_beanie
import motor, os

from domain.apps.models import App
from domain.clickstream_event_properties.models import ClickStreamEventProperties
from domain.datamart.models import DataMart
from domain.datasources.models import DataSource
from domain.edge.models import BaseEdge
from domain.edge.models import Edge
from domain.edge.models import RichEdge
from domain.event_properties.models import EventProperties
from domain.files.models import File
from domain.integrations.models import Integration
from domain.apperture_users.models import AppertureUser
from domain.runlogs.models import RunLog
from domain.notifications.models import Notification
from domain.funnels.models import Funnel
from domain.segments.models import Segment
from domain.properties.models import Properties
from domain.metrics.models import Metric
from domain.actions.models import Action
from domain.retention.models import Retention
from domain.spreadsheets.models import WorkBook


class Mongo:
    async def init(self):
        self.client = motor.motor_asyncio.AsyncIOMotorClient(os.environ.get("DB_URI"))
        await init_beanie(
            database=self.client[os.environ.get("DB_NAME")],
            document_models=[
                AppertureUser,
                App,
                Integration,
                DataSource,
                BaseEdge,
                Edge,
                RichEdge,
                RunLog,
                Notification,
                Funnel,
                Segment,
                Properties,
                Metric,
                Action,
                Retention,
                EventProperties,
                WorkBook,
                ClickStreamEventProperties,
                DataMart,
                File,
            ],
        )

    async def close(self):
        self.client.close()
