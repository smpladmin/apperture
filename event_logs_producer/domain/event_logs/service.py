from apperture.backend_action import get
from cache.cache import event_config_cache, CACHE_EXPIRY_10_MINUTES
from fastapi_cache.decorator import cache


class EventLogsService:
    def __init__(self):
        pass

    @cache(expire=CACHE_EXPIRY_10_MINUTES, key_builder=event_config_cache)
    async def get_config_for_datasource(self, datasource_id):
        response = get(f"/private/datasources/{datasource_id}").json()
        credential = response.get("credential", {})
        config_credential = credential.get("eventsConfigCredential", {})
        return config_credential and config_credential.get("config", None)
