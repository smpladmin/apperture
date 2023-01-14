from pydantic import BaseModel
from typing import Optional
from .model_response import ModelResponse
from domain.users.models import UserDetails


class UserPropertyDto(BaseModel):
    user_id: str
    datasource_id: str
    event: Optional[str]


class UserPropertyResponse(UserDetails, ModelResponse):
    class Config:
        allow_population_by_field_name = True
