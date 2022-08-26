from typing import Optional

from fastapi import Depends, HTTPException

from authorisation.jwt_auth import validate
from rest.middlewares.get_token import get_token


async def validate_jwt(token: Optional[str] = Depends(get_token)):
    exception = HTTPException(status_code=401, detail="Invalid JWT")
    if not (token):
        raise exception
    try:
        validate(token)
    except:
        raise exception
