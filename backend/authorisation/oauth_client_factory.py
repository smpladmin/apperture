import os
import json
from typing import Optional

from oauthlib.common import to_unicode
from starlette.config import Config
from authlib.integrations.starlette_client import OAuth

from .oauth_provider import GoogleOauthContext, OAuthProvider


class OAuthClientFactory:
    def __init__(self):
        self._init_map = {
            OAuthProvider.GOOGLE: self._google_oauth_client,
            OAuthProvider.SLACK: self._slack_oauth_client,
        }
        config_data = {
            "GOOGLE_CLIENT_ID": os.environ.get("GOOGLE_OAUTH_CLIENT_ID"),
            "GOOGLE_CLIENT_SECRET": os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET"),
        }
        starlette_config = Config(environ=config_data)
        self.oauth = OAuth(starlette_config)

    def init_client(
        self,
        provider: OAuthProvider,
        scope="openid email profile",
        google_oauth_context: Optional[GoogleOauthContext] = None,
    ) -> OAuth:
        if provider not in self._init_map:
            raise NotImplementedError(
                f"OAuth not implemented for given provider - {provider}"
            )

        if (
            provider == OAuthProvider.GOOGLE
            and google_oauth_context == GoogleOauthContext.SHEET
        ):
            client_id = os.environ.get("GOOGLE_SHEET_CLIENT_ID")
            client_secret = os.environ.get("GOOGLE_SHEET_CLIENT_SECRET")
            return self._init_map[provider](scope, client_id, client_secret)

        return self._init_map[provider](scope)

    def _google_oauth_client(self, scope: str, client_id=None, client_secret=None):
        if client_id and client_secret:
            starlette_config = Config(
                environ={
                    "GOOGLE_CLIENT_ID": client_id,
                    "GOOGLE_CLIENT_SECRET": client_secret,
                }
            )
            self.oauth = OAuth(starlette_config)
        self.oauth.register(
            name="google",
            server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
            client_kwargs={"scope": scope},
        )
        return self.oauth

    def _slack_oauth_client(self, scope: str):
        def slack_compliance_fix(session):
            def _fix(resp):
                resp.raise_for_status()
                token = resp.json()
                token["token_type"] = "Bearer"
                resp._content = to_unicode(json.dumps(token)).encode("utf-8")
                return resp

            session.register_compliance_hook("access_token_response", _fix)

        self.oauth.register(
            name="slack",
            client_id=os.environ.get("SLACK_OAUTH_CLIENT_ID"),
            client_secret=os.environ.get("SLACK_OAUTH_CLIENT_SECRET"),
            authorize_url=os.environ.get("SLACK_OAUTH_AUTHORIZE_URL"),
            access_token_url=os.environ.get("SLACK_OAUTH_ACCESS_URL"),
            compliance_fix=slack_compliance_fix,
            scope=scope,
        )
        return self.oauth
