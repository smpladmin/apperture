from typing import Optional
from fastapi import Cookie, Header
from settings import apperture_settings

settings = apperture_settings()


def get_token(
    auth_token: Optional[str] = Cookie(default=None, alias=settings.cookie_key),
    authorization: Optional[str] = Header(None),
) -> Optional[str]:
    token = auth_token if auth_token else authorization
    return token
