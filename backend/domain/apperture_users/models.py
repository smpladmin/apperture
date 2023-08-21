from typing import Optional

from beanie import Indexed

from repositories import Document


class AppertureUser(Document):
    first_name: str
    last_name: str
    email: Indexed(str)
    password: Optional[str]
    picture: Optional[str]
    slack_channel: Optional[str]
    slack_url: Optional[str]
    has_visted_sheets: bool = True
    is_signed_up: bool = True

    class Settings:
        name = "users"
