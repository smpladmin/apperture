from typing import Optional, Union

from fastapi import Cookie, HTTPException

from authorisation.jwt_auth import validate


async def validate_jwt(auth_token: Optional[str] = Cookie(None)):
    exception = HTTPException(status_code=401, detail="Invalid JWT")
    if not auth_token:
        raise exception
    try:
        validate(auth_token)
    except:
        raise exception
