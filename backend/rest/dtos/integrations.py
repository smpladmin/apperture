from typing import Optional
from domain.integrations.models import Credential, Integration
from .model_response import ModelResponse


class IntegrationResponse(Integration, ModelResponse):
    credential: Optional[Credential]
