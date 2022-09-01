from beanie import Indexed, PydanticObjectId

from repositories import Document


class App(Document):
    name: str
    user_id: Indexed(PydanticObjectId)

    class Settings:
        name = "apps"
