from beanie import Document, Indexed


class User(Document):
    first_name: str
    last_name: str
    email: Indexed(str)
    picture: str

    class Settings:
        name = "users"
