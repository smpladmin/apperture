from typing import Optional

from beanie import Indexed
from pydantic import Field

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
    api_key: Optional[str] = Field(hidden=True)
    sheet_token: Optional[str] = Field(hidden=True)

    class Settings:
        name = "users"
