from typing import Optional

from beanie import PydanticObjectId
from pydantic import BaseModel

from domain.apperture_users.models import AppertureUser

from .model_response import ModelResponse


class PrivateUserResponse(AppertureUser, ModelResponse):
    pass


class AppertureUserResponse(ModelResponse):
    id: PydanticObjectId
    first_name: str
    last_name: str
    email: str
    picture: Optional[str]
    slack_channel: Optional[str]
    has_visited_sheets: Optional[bool]

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class CreateUserDto(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str


class ResetPasswordDto(BaseModel):
    email: str
    password: str
