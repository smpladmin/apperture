from typing import Optional, List
from pydantic import BaseModel

from domain.apps.models import App, OrgAccess
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
    shareWithEmails: Optional[List[str]]
    orgAccess: Optional[bool]


class OrgAccessResponse(OrgAccess, ModelResponse):
    class Config:
        allow_population_by_field_name = True
