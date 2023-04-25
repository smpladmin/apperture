from typing import Optional
from fastapi import Request, Response
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis


CACHE_EXPIRY_24_HOURS = 60 * 60 * 24
CACHE_EXPIRY_10_MINUTES = 60 * 10


def init_cache(redis_host: str, redis_password: str):
    redis = aioredis.from_url(
        f"redis://:{redis_password}@{redis_host}",
        encoding="utf8",
        decode_responses=True,
    )
    FastAPICache.init(RedisBackend(redis), prefix="apperture-cache")


def datasource_key_builder(
    func,
    namespace: Optional[str] = "",
    request: Request = None,
    response: Response = None,
    *args,
    **kwargs,
):
    prefix = FastAPICache.get_prefix()
    path_params = ":".join(request.path_params.values())
    query_params = ":".join(request.query_params.values())
    cache_key = f"{prefix}:{namespace}:{func.__name__}:{path_params}:{query_params}"
    return cache_key


def service_datasource_key_builder(
    func,
    namespace: Optional[str] = "",
    request: Request = None,
    response: Response = None,
    *args,
    **kwargs,
):
    prefix = FastAPICache.get_prefix()
    cache_key = f"{prefix}:{namespace}:{func.__name__}:{kwargs['args'][1]}"
    return cache_key
