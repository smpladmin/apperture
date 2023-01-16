from typing import Optional
from beanie import Indexed

from domain.users.models import User
from .model_response import ModelResponse


class PrivateUserResponse(User, ModelResponse):
    pass


class UserResponse(ModelResponse):
    first_name: str
    last_name: str
    email: Indexed(str)
    picture: str
    slack_channel: Optional[str]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True
