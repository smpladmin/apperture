from fastapi import Depends, Header, HTTPException
from domain.apperture_users.service import AppertureUserService


async def validate_api_key_and_user(
    user_email: str = Header(None),
    api_key: str = Header(None),
    user_service: AppertureUserService = Depends(),
):
    if not api_key:
        raise HTTPException(status_code=401, detail="API Key missing")

    if not user_email:
        raise HTTPException(status_code=401, detail="User email missing")

    user = await user_service.get_user_by_api_key(api_key=api_key)
    isValidUser = user and user.email == user_email

    if not isValidUser:
        raise HTTPException(status_code=403, detail="Access forbidden")
