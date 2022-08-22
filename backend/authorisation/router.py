from fastapi import APIRouter, Request, HTTPException, status
from starlette.responses import JSONResponse
from authlib.integrations.starlette_client import OAuthError
from .oauth import oauth

router = APIRouter(tags=["auth"])


@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("authorise")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/authorise")
async def authorise(request: Request):
    try:
        access_token = await oauth.google.authorize_access_token(request)
    except OAuthError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    oauth_user = access_token.get("userinfo")
    # TODO: save details in database and generate JWT token
    # TODO: return the JWT token as cookie
    return JSONResponse({"result": True, "access_token": "jwt"})
