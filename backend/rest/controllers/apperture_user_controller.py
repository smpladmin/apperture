from typing import Optional
from fastapi import APIRouter, Depends

from domain.apperture_users.service import AppertureUserService
from rest.dtos.apperture_users import AppertureUserResponse
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
    user = await user_service.get_user(user_id)
    return AppertureUserResponse(
        id=user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        picture=user.picture,
        slack_channel=user.slack_channel,
        has_visited_sheets=user.has_visted_sheets,
    )


@router.put("/apperture-users")
async def remove_slack_credentials(
    delete_slack_credentials: Optional[bool] = None,
    has_visited_sheets: Optional[bool] = None,
    user_id: str = Depends(get_user_id),
    user_service: AppertureUserService = Depends(),
):
    if delete_slack_credentials:
        return await user_service.remove_slack_credentials(user_id)

    if has_visited_sheets:
        return await user_service.update_visited_sheets_status(user_id=user_id)
