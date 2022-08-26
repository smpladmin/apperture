from beanie import Document, Indexed


class App(Document):
    name: str
    user_id: str

    class Settings:
        name = "apps"
