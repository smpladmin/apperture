from functools import lru_cache
from pydantic import BaseSettings


class AppertureSettings(BaseSettings):
    db_uri: str
    db_name: str
    google_oauth_client_id: str
    google_oauth_client_secret: str
    session_secret: str
    jwt_secret: str
    jwt_expiry_minutes: int
    cookie_domain: str
    cookie_key: str = "auth_token"
    frontend_login_redirect_url: str
    redis_host: str
    redis_password: str
    apperture_api_key: str
    fastapi_env: str

    class Config:
        env_file = ".env"


@lru_cache()
def apperture_settings():
    return AppertureSettings()
