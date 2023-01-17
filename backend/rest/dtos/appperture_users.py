from typing import Optional
from beanie import Indexed

from domain.apperture_users.models import AppertureUser
from .model_response import ModelResponse


class PrivateUserResponse(AppertureUser, ModelResponse):
    pass


class AppertureUserResponse(ModelResponse):
    first_name: str
    last_name: str
    email: Indexed(str)
    picture: str
    slack_channel: Optional[str]

    class Config:
        allow_population_by_field_name = True
