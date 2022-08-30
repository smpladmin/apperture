from beanie import Document, Indexed


class App(Document):
    name: str
    user_id: Indexed(str)

    class Settings:
        name = "apps"
