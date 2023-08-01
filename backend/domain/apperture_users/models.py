from beanie import Indexed
from typing import Optional

from repositories import Document


class AppertureUser(Document):
    first_name: str
    last_name: str
    email: Indexed(str)
    password: Optional[str]
    picture: Optional[str]
    slack_channel: Optional[str]
    slack_url: Optional[str]
    is_invited: Optional[bool] = False

    class Settings:
        name = "users"
