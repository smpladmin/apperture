from typing import Annotated
from fastapi import APIRouter, Depends

from rest.dtos.knowledge import FaqDto
from domain.knowledge.service import KnowledgeService
from rest.middlewares.validate_api_key import validate_api_key

router = APIRouter(
    tags=["knowledge"],
    dependencies=[Depends(validate_api_key)],
    responses={401: {}},
)


@router.post("/knowledge/faqs")
async def create(
    faqs: list[FaqDto],
    service: Annotated[KnowledgeService, Depends()],
):
    return service.save_faqs(faqs)


@router.get("/knowledge/faqs")
async def get(service: Annotated[KnowledgeService, Depends()]):
    return service.get_faqs()


@router.delete("/knowledge/faqs/{id}")
async def get(id: str, service: Annotated[KnowledgeService, Depends()]):
    return service.delete_faq(id)
