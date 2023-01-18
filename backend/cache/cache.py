from typing import Optional
from fastapi import Request, Response
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis


def init_cache(redis_host: str, redis_password: str):
    redis = aioredis.from_url(
        f"redis://:{redis_password}@{redis_host}",
        encoding="utf8",
        decode_responses=True,
    )
    FastAPICache.init(RedisBackend(redis), prefix="apperture-cache")


def datasource_edges_key_builder(
    func,
    namespace: Optional[str] = "",
    request: Request = None,
    response: Response = None,
    *args,
    **kwargs,
):
    prefix = FastAPICache.get_prefix()
    cache_key = f"{prefix}:{namespace}:edges:{request.path_params['ds_id']}"
    return cache_key
