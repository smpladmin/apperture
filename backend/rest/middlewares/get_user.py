from typing import Optional

from fastapi import Cookie, Depends
from authorisation.jwt_auth import decode
from domain.users.service import UserService
from rest.middlewares.get_token import get_token


async def get_user(
    token: Optional[str] = Depends(get_token),
    user_service: UserService = Depends(),
):
    if not token:
        return None
    principal = decode(token)
    return await user_service.get_user(principal["user_id"])
