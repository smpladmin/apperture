from typing import List
from fastapi import APIRouter, Depends

from domain.apps.service import AppService
from domain.users.models import User
from rest.dtos.apps import AppResponse, CreateAppDto
from rest.middlewares import get_user, validate_jwt


router = APIRouter(
    tags=["apps"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.post("/apps", response_model=AppResponse)
async def create_app(
    app_dto: CreateAppDto,
    user: User = Depends(get_user),
    app_service: AppService = Depends(),
):
    return await app_service.create_app(app_dto.name, user)


@router.get("/apps", response_model=List[AppResponse])
async def get_apps(
    user: User = Depends(get_user),
    app_service: AppService = Depends(),
):
    return await app_service.get_apps(user)
