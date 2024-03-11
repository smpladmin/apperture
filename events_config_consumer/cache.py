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
    FastAPICache.init(RedisBackend(redis))


def event_config_cache(*args, **kwargs):
    datasource_id = kwargs["kwargs"]["datasource_id"]
    return f"{datasource_id}-event-config-cache"
