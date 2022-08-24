from domain.users.models import User
from .model_response import ModelResponse


class UserResponse(User, ModelResponse):
    pass
