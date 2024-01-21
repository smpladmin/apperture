import logging

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends
from domain.chat.service import ChatService
from rest.dtos.chat import (
    AnswerResponse,
    ChatSettingsUpdate,
    QuestionRequestDto,
    ChatSettingsResponse,
)

from rest.middlewares.validate_api_key import validate_api_key

router = APIRouter(
    tags=["chat"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
)


@router.post("/chat/ask", response_model=AnswerResponse)
async def respond(
    dto: QuestionRequestDto,
    service: ChatService = Depends(),
):
    if not dto.question:
        logging.info("Received empty question")
        return AnswerResponse(answer="")

    answer = await service.generate_response(
        dto.question,
        dto.user_id,
    )
    return AnswerResponse(answer=answer)


@router.post("/chat/settings")
async def update_chat_settings(
    dto: ChatSettingsUpdate,
    chat_service: ChatService = Depends(),
):
    return await chat_service.update_chat_settings(update=dto)


@router.get("/chat/settings", response_model=ChatSettingsResponse)
async def get_chat_settings(
    user_id: str,
    chat_service: ChatService = Depends(),
):
    return await chat_service.get_chat_settings(user_id=PydanticObjectId(user_id))


@router.get("/chat/parsed/message")
def get_parsed_answer(
    answer: str,
    chat_service: ChatService = Depends(),
):
    return chat_service.parse_chat_answers(answer)
