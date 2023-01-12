from fastapi import APIRouter, Depends

from domain.apperture_users.service import AppertureUserService
from rest.dtos.appperture_users import AppertureUserResponse
from rest.middlewares import get_user_id, validate_jwt


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
    return await user_service.get_user(user_id)


@router.put("/apperture-users")
async def remove_slack_credentials(
    delete_slack_credentials: bool,
    user_id: str = Depends(get_user_id),
    user_service: AppertureUserService = Depends(),
):
    if delete_slack_credentials:
        return await user_service.remove_slack_credentials(user_id)
