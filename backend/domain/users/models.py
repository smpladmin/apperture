from beanie import Indexed

from repositories import Document


class User(Document):
    first_name: str
    last_name: str
    email: Indexed(str)
    picture: str

    class Settings:
        name = "users"
