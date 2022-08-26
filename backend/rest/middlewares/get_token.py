from typing import Optional
from fastapi import Cookie, Header


def get_token(
    auth_token: Optional[str] = Cookie(None),
    authorization: Optional[str] = Header(None),
) -> Optional[str]:
    token = auth_token if auth_token else authorization
    return token
