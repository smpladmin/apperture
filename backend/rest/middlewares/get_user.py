from typing import Optional

from fastapi import Cookie, Depends
from authorisation.jwt_auth import decode
from domain.users.service import UserService


async def get_user(
    auth_token: Optional[str] = Cookie(None), user_service: UserService = Depends()
):
    if not auth_token:
        return None
    principal = decode(auth_token)
    return await user_service.get_user(principal["user_id"])
