from fastapi_cache.decorator import cache
from cache import CACHE_EXPIRY_10_MINUTES, api_key_builder
from apperture.backend_action import get


class AppService:
    def __init__(self):
        pass

    @cache(expire=CACHE_EXPIRY_10_MINUTES, key_builder=api_key_builder)
    async def get_app_by_api_key(self, api_key: str):
        return get(path=f"/private/apps?api_key={api_key}").json()
