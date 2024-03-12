from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class EventsSettings(BaseSettings):
    redis_host: str
    redis_password: str
    kafka_bootstrap_servers: str
    max_records: int = 1
    timeout_ms: int = 60000
    backend_base_url: str
    backend_api_key_name: str
    backend_api_key_secret: str
    slack_url: str
    auto_offset_reset: str = "latest"

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache()
def events_settings():
    return EventsSettings()
