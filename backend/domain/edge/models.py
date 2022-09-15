from beanie import PydanticObjectId
from domain.common.models import IntegrationProvider
from repositories import Document


class Edge(Document):
    datasource_id: PydanticObjectId
    provider: IntegrationProvider
    previous_event: str
    current_event: str
    users: int
    hits: int
    date: str
    rolled_previous_event: str
    rolled_current_event: str

    class Settings:
        name = "edges"
