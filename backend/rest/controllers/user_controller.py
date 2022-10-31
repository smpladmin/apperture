from fastapi import APIRouter, Depends

from domain.users.models import User
from domain.users.service import UserService
from rest.dtos.users import UserResponse
from rest.middlewares import get_user_id, validate_jwt


router = APIRouter(
    tags=["users"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get('/users/me', response_model=UserResponse)
async def get_current_user(
    user_id: User = Depends(get_user_id),
    user_service: UserService = Depends(),
):
    return await user_service.get_user(user_id)


@router.delete('/users/slack_credentials')
async def remove_slack_credentials(
    user_id: User = Depends(get_user_id),
    user_service: UserService = Depends(),
): 
    return await user_service.remove_slack_credentials(user_id)
