from typing import Optional
from fastapi import Request, Response
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis


CACHE_EXPIRY_10_MINUTES = 60 * 10


def init_cache(redis_host: str, redis_password: str):
    redis = aioredis.from_url(
        f"redis://:{redis_password}@{redis_host}",
        encoding="utf8",
        decode_responses=True,
    )
    FastAPICache.init(RedisBackend(redis), prefix="apperture-cache")


def api_key_builder(
    func,
    namespace: Optional[str] = "",
    request: Request = None,
    response: Response = None,
    *args,
    **kwargs,
):
    prefix = FastAPICache.get_prefix()
    api_key = kwargs["kwargs"]["api_key"]
    cache_key = f"{prefix}:{api_key}"
    return cache_key
