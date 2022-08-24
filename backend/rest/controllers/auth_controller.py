import os
from fastapi import APIRouter, Request, HTTPException, status, Depends
from authlib.integrations.starlette_client import OAuthError
from starlette.responses import RedirectResponse

from authorisation.jwt_auth import create_access_token
from domain.users.service import UserService
from authorisation.oauth import oauth

router = APIRouter(tags=["auth"])


@router.get("/login")
async def login(
    request: Request, redirect_url: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL")
):
    redirect_uri = request.url_for("authorise")
    return await oauth.google.authorize_redirect(
        request, redirect_uri, state=redirect_url
    )


@router.get("/authorise")
async def authorise(
    request: Request,
    user_service: UserService = Depends(),
    state: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL"),
):
    apperture_user = await _authorize_and_save_user(request, user_service)
    return await _redirect_with_auth_cookie(state, str(apperture_user.id))


async def _redirect_with_auth_cookie(redirect_url: str, user_id: str):
    jwt = create_access_token({"user_id": user_id})
    response = RedirectResponse(url=redirect_url)
    response.set_cookie(
        key="auth_token",
        value=jwt,
        domain=os.getenv("COOKIE_DOMAIN"),
        httponly=True,
        secure=True,
        expires=int(os.getenv("JWT_EXPIRY_MINUTES")) * 60,
    )
    return response


async def _authorize_and_save_user(request: Request, user_service: UserService):
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
