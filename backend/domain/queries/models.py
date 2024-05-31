from beanie import PydanticObjectId
from repositories import Document


class Queries(Document):
    datasource_id: PydanticObjectId
    app_id: PydanticObjectId
    user_id: PydanticObjectId
    query: str
