from beanie import PydanticObjectId
from pydantic import BaseModel

from domain.chat.models import ChatSettings
from rest.dtos.model_response import ModelResponse


class QuestionRequestDto(BaseModel):
    question: str
    user_id: PydanticObjectId


class AnswerResponse(BaseModel):
    answer: str


class ChatSettingsUpdate(BaseModel):
    user_id: PydanticObjectId
    system_message: str = None
    history_length: int = None


class ChatSettingsResponse(ChatSettings, ModelResponse):
    class Config:
        allow_population_by_field_name = True
