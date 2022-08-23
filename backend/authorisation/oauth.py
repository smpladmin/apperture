import os
from starlette.config import Config
from authlib.integrations.starlette_client import OAuth


config_data = {
    "GOOGLE_CLIENT_ID": os.environ.get("GOOGLE_OAUTH_CLIENT_ID"),
    "GOOGLE_CLIENT_SECRET": os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET"),
}
starlette_config = Config(environ=config_data)
oauth = OAuth(starlette_config)

# Only applicable for GA integration
authorize_params = {
    "prompt": "consent",
    "access_type": "offline",
}
oauth.register(
    name="google",
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile",
    },
    authorize_params={},
)
