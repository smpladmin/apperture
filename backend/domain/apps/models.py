from typing import Set
from beanie import Indexed, PydanticObjectId

from repositories import Document


class App(Document):
    name: str
    user_id: Indexed(PydanticObjectId)
    shared_with: Set[PydanticObjectId] = set()
    enabled: bool = True

    class Settings:
        name = "apps"
