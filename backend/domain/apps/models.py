from beanie import Indexed

from repositories import Document


class App(Document):
    name: str
    user_id: Indexed(str)

    class Settings:
        name = "apps"
