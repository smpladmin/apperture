import os
from starlette.config import Config
from authlib.integrations.starlette_client import OAuth

from .oauth_provider import OAuthProvider


class OAuthClientFactory:
    def init_client(
        self,
        provider: OAuthProvider,
        scope="openid email profile",
    ) -> OAuth:
        if provider == OAuthProvider.GOOGLE:
            return self._google_oauth_client(scope)
        else:
            raise NotImplementedError(
                f"OAuth not implemented for given provider - {provider}"
            )

    def _google_oauth_client(self, scope: str):
        config_data = {
            "GOOGLE_CLIENT_ID": os.environ.get("GOOGLE_OAUTH_CLIENT_ID"),
            "GOOGLE_CLIENT_SECRET": os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET"),
        }
        starlette_config = Config(environ=config_data)
        oauth = OAuth(starlette_config)
        oauth.register(
            name="google",
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": scope},
        )
        return oauth
