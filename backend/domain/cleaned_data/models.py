from beanie import PydanticObjectId
from domain.common.models import IntegrationProvider
from repositories import Document


class CleanedData(Document):
    datasource_id: PydanticObjectId
    provider: IntegrationProvider
    previous_event: str
    current_event: str
    users: int
    hits: int
    date: str

    class Settings:
        name = "cleaned_data"
