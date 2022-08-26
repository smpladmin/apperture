from pydantic import BaseModel

from domain.apps.models import App
from rest.dtos.model_response import ModelResponse


class CreateAppDto(BaseModel):
    name: str


class AppResponse(App, ModelResponse):
    pass
