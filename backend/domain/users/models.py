from beanie import Indexed
from typing import Optional

from repositories import Document


class User(Document):
    first_name: str
    last_name: str
    email: Indexed(str)
    picture: str
    slack_channel: Optional[str]
    slack_url: Optional[str]

    class Settings:
        name = "users"
