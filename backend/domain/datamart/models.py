import datetime

from beanie import PydanticObjectId
from repositories import Document


class DataMart(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    name: str
    table_name: str
    last_refreshed: datetime.datetime
    query: str
    enabled: bool = True

    class Settings:
        name = "datamart"
