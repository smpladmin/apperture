import os
from fastapi import APIRouter, Request, HTTPException, status, Depends
from authlib.integrations.starlette_client import OAuthError
from starlette.responses import RedirectResponse

from authorisation.jwt_auth import create_access_token
from domain.apperture_users.service import AppertureUserService
from authorisation import OAuthClientFactory, OAuthProvider
from settings import apperture_settings

router = APIRouter(tags=["auth"])

oauth = OAuthClientFactory().init_client(OAuthProvider.GOOGLE)
settings = apperture_settings()


@router.get("/login")
async def login(
    request: Request, redirect_url: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL")
):
    redirect_uri = request.url_for("authorise")
    if not "localhost" in redirect_uri:
        redirect_uri = redirect_uri.replace("http", "https")
    return await oauth.google.authorize_redirect(
        request, redirect_uri, state=redirect_url
    )


@router.get("/authorise")
async def authorise(
    request: Request,
    user_service: AppertureUserService = Depends(),
    state: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL"),
):
    apperture_user = await _authorize_and_save_user(request, user_service)
    return await _redirect_with_auth_cookie(state, str(apperture_user.id))


async def _redirect_with_auth_cookie(redirect_url: str, user_id: str):
    jwt = create_access_token({"user_id": user_id})
    response = RedirectResponse(url=redirect_url)
    response.set_cookie(
        key=settings.cookie_key,
        value=jwt,
        domain=os.getenv("COOKIE_DOMAIN"),
        httponly=True,
        secure=os.getenv("FASTAPI_ENV") != "development",
        expires=int(os.getenv("JWT_EXPIRY_MINUTES")) * 60,
    )
    return response


async def _authorize_and_save_user(request: Request, user_service: AppertureUserService):
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


@router.get("/logout")
async def logout(redirect_url: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL")):
    response = RedirectResponse(url=redirect_url)
    response.set_cookie(
        key=settings.cookie_key,
        domain=os.getenv("COOKIE_DOMAIN"),
        httponly=True,
        secure=True,
        expires=0,
        max_age=0,
    )
    return response
