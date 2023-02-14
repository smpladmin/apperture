import os
import httpx
from domain.common.models import IntegrationProvider
from argon2 import PasswordHasher


class AuthService:
    def __init__(self):
        self.access_token_methods = {}
        self.access_token_methods[
            IntegrationProvider.GOOGLE
        ] = self._get_google_access_token
        self.hasher = PasswordHasher(time_cost=2, parallelism=1)

    async def get_access_token(
        self, refresh_token: str, provider: IntegrationProvider
    ) -> str:
        if provider not in self.access_token_methods:
            raise NotImplementedError(
                f"access token refresh not implemented for {provider}"
            )
        else:
            return await self.access_token_methods[provider](refresh_token)

    async def _get_google_access_token(self, refresh_token: str):
        async with httpx.AsyncClient() as client:
            res = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": os.getenv("GOOGLE_OAUTH_CLIENT_ID"),
                    "client_secret": os.getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                },
            )
            data = res.json()
            return data["access_token"]

    def hash_password(self, password: str) -> str:
        return self.hasher.hash(password)

    def verify_password(self, hash: str, password: str):
        try:
            self.hasher.verify(hash, password)
            return self.rehash_password(hash, password)
        except:
            return None

    def rehash_password(self, hash: str, password: str) -> str:
        if self.hasher.check_needs_rehash(hash):
            return self.hasher.hash(password)
        else:
            return hash
