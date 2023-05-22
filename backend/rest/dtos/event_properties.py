from typing import List

from pydantic import BaseModel

from domain.common.models import IntegrationProvider


class EventPropertiesDto(BaseModel):
    event: str
    properties: List[str]
    provider: IntegrationProvider
