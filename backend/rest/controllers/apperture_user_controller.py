from typing import List, Union

from fastapi import APIRouter, Depends

from domain.apperture_users.service import AppertureUserService
from domain.apps.service import AppService
from rest.dtos.apperture_users import AppertureUserResponse, PrivateUserResponse
from rest.middlewares import get_user_id, validate_jwt, get_user

router = APIRouter(
    tags=["apperture-users"],
    dependencies=[Depends(validate_jwt)],
    responses={401: {}},
)


@router.get("/apperture-users/me", response_model=AppertureUserResponse)
async def get_current_user(
    user_id: str = Depends(get_user_id),
    user_service: AppertureUserService = Depends(),
):
    user = await user_service.get_user(user_id)
    return AppertureUserResponse(
        id=user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        picture=user.picture,
        slack_channel=user.slack_channel,
    )


@router.put("/apperture-users")
async def remove_slack_credentials(
    delete_slack_credentials: bool,
    user_id: str = Depends(get_user_id),
    user_service: AppertureUserService = Depends(),
):
    if delete_slack_credentials:
        return await user_service.remove_slack_credentials(user_id)


@router.get("/apperture-users", response_model=List[PrivateUserResponse])
async def get_apperture_users(
    app_id: Union[str, None] = None,
    user_service: AppertureUserService = Depends(),
    app_service: AppService = Depends(),
):
    if app_id:
        user_ids = await app_service.get_users_for_app(app_id=app_id)
        return [await user_service.get_user(id=user_id) for user_id in user_ids]
    else:
        return await user_service.get_all_apperture_users()
