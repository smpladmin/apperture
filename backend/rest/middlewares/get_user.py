from typing import Optional

from fastapi import Cookie, Depends
from authorisation.jwt_auth import decode
from domain.apperture_users.service import AppertureUserService
from rest.middlewares.get_token import get_token


async def get_user(
    token: Optional[str] = Depends(get_token),
    user_service: AppertureUserService = Depends(),
):
    if not token:
        return None
    principal = decode(token)
    return await user_service.get_user(principal["user_id"])


async def get_user_id(token: Optional[str] = Depends(get_token)):
    if not token:
        return None
    principal = decode(token)
    return principal["user_id"]
