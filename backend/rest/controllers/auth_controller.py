import os

from authlib.integrations.starlette_client import OAuthError
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from starlette.responses import RedirectResponse

from authorisation import OAuthClientFactory, OAuthProvider
from authorisation.jwt_auth import create_access_token
from authorisation.service import AuthService
from domain.apperture_users.service import AppertureUserService
from repositories.clickhouse.parser.query_parser import BusinessError
from rest.dtos.apperture_users import CreateUserDto, ResetPasswordDto
from rest.middlewares import validate_recaptcha_token
from settings import apperture_settings

router = APIRouter(tags=["auth"])

oauth = OAuthClientFactory().init_client(OAuthProvider.GOOGLE)
settings = apperture_settings()


@router.get("/login")
async def login(
    request: Request, redirect_url: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL")
):
    redirect_uri = request.url_for("authorise")
    if not "localhost" in redirect_uri.hostname:
        redirect_uri = redirect_uri.replace(scheme="https")
    return await oauth.google.authorize_redirect(
        request, str(redirect_uri), state=redirect_url
    )


@router.post("/login/password")
async def login_with_password(
    response: Response,
    dto: ResetPasswordDto,
    user_service: AppertureUserService = Depends(),
    auth_service: AuthService = Depends(),
):
    apperture_user = await user_service.get_user_by_email(dto.email)
    new_hash = auth_service.verify_password(apperture_user.password, dto.password)
    if not new_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    await user_service.save_password(apperture_user, new_hash)
    jwt = create_access_token({"user_id": str(apperture_user.id)})

    response.set_cookie(
        key=settings.cookie_key,
        value=jwt,
        domain=os.getenv("COOKIE_DOMAIN"),
        httponly=True,
        secure=os.getenv("FASTAPI_ENV") != "development",
        expires=int(os.getenv("JWT_EXPIRY_MINUTES")) * 60,
    )
    return apperture_user


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


async def _authorize_and_save_user(
    request: Request, user_service: AppertureUserService
):
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


@router.post("/register", dependencies=[Depends(validate_recaptcha_token)])
async def register(
    response: Response,
    dto: CreateUserDto,
    user_service: AppertureUserService = Depends(),
    auth_service: AuthService = Depends(),
):
    try:
        hash = auth_service.hash_password(dto.password)
        apperture_user = await user_service.create_user_with_password(
            dto.first_name, dto.last_name, dto.email, hash
        )
        jwt = create_access_token({"user_id": str(apperture_user.id)})

        response.set_cookie(
            key=settings.cookie_key,
            value=jwt,
            domain=os.getenv("COOKIE_DOMAIN"),
            httponly=True,
            secure=os.getenv("FASTAPI_ENV") != "development",
            expires=int(os.getenv("JWT_EXPIRY_MINUTES")) * 60,
        )
        return apperture_user
    except BusinessError as e:
        raise HTTPException(status_code=400, detail=str(e) or "Something went wrong")
