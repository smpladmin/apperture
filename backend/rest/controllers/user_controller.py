from typing import Union, str

from fastapi import APIRouter, Depends

from domain.users.service import UserService
from rest.dtos.users import UserPropertyResponse
from rest.middlewares import validate_jwt

router = APIRouter(
    tags=["user"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/user/property", response_model=UserPropertyResponse)
async def get_user(
    user_id,
    datasource_id,
    event,
    user_service: UserService = Depends(),
):
    return await user_service.get_user_properties(user_id, datasource_id, event)
