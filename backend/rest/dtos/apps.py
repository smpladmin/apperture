from typing import Optional
from pydantic import BaseModel

from domain.apps.models import App
from rest.dtos.integrations import IntegrationWithDataSources
from rest.dtos.model_response import ModelResponse


class CreateAppDto(BaseModel):
    name: str


class AppResponse(App, ModelResponse):
    pass


class AppWithIntegrations(App, ModelResponse):
    shared: bool = False
    integrations: list[IntegrationWithDataSources] = []

    class Config:
        orm_mode = True


class UpdateAppDto(BaseModel):
    share_with_email: Optional[str]
