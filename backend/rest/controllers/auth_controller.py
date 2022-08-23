from fastapi import APIRouter, Request, HTTPException, status, Depends
from authlib.integrations.starlette_client import OAuthError

from domain.users.service import UserService
from rest.dtos.users import UserResponse
from authorisation.oauth import oauth

router = APIRouter(tags=["auth"])


@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("authorise")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/authorise", response_model=UserResponse)
async def authorise(request: Request, user_service: UserService = Depends()):
    try:
        access_token = await oauth.google.authorize_access_token(request)
    except OAuthError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    oauth_user = access_token.get("userinfo")
    return await user_service.create_user_if_not_exists(oauth_user)
