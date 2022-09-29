import json
import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from authlib.integrations.starlette_client import OAuthError
from starlette.responses import RedirectResponse
from urllib.parse import urlparse

from authorisation import OAuthClientFactory, OAuthProvider
from authorisation.models import IntegrationOAuth, OAuthUser
from domain.apps.service import AppService
from domain.integrations.models import IntegrationProvider
from domain.integrations.service import IntegrationService
from domain.users.models import User
from domain.users.service import UserService
from rest.dtos.oauth import OAuthState
from rest.middlewares import get_user, validate_jwt

router = APIRouter(tags=["integration"], responses={401: {}})

oauth = OAuthClientFactory().init_client(
    OAuthProvider.GOOGLE,
    scope="openid email profile https://www.googleapis.com/auth/analytics.readonly",
)


@router.get("/integrations/oauth/google", dependencies=[Depends(validate_jwt)])
async def oauth_google(
    request: Request,
    app_id: str,
    user: User = Depends(get_user),
    redirect_url: str = os.getenv("FRONTEND_LOGIN_REDIRECT_URL"),
):
    redirect_uri = request.url_for("integration_google_authorise")
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri,
        state=json.dumps(
            {"app_id": app_id, "user_id": str(user.id), "redirect_url": redirect_url}
        ),
        prompt="consent",
        access_type="offline",
    )


@router.get("/integrations/oauth/google/authorise")
async def integration_google_authorise(
    request: Request,
    state: str,
    user_service: UserService = Depends(),
    app_service: AppService = Depends(),
    integration_service: IntegrationService = Depends(),
):
    access_token = await _authorise(request)
    oauth_state = OAuthState.parse_raw(state)
    oauth_user = OAuthUser.parse_obj(access_token.get("userinfo"))
    refresh_token = access_token.get("refresh_token")
    integration_oauth = IntegrationOAuth(
        refresh_token=refresh_token, account_id=oauth_user.email
    )
    apperture_user = await user_service.get_user(oauth_state.user_id)
    app = await app_service.get_app(oauth_state.app_id)
    integration = await integration_service.create_oauth_integration(
        apperture_user, app, IntegrationProvider.GOOGLE, integration_oauth
    )
    redirect_url = _build_redirect_url(oauth_state.redirect_url, integration.id)
    return RedirectResponse(redirect_url)


async def _authorise(request: Request):
    try:
        access_token = await oauth.google.authorize_access_token(request)
        return access_token
    except OAuthError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _build_redirect_url(url: str, integration_id: str):
    redirect_url = urlparse(url)
    if redirect_url.query:
        redirect_url = redirect_url._replace(
            query=f"{redirect_url.query}&integration_id={integration_id}"
        )
    else:
        redirect_url = redirect_url._replace(query=f"integration_id={integration_id}")
    return redirect_url.geturl()
