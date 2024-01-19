from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class AppySettings(BaseSettings):
    vectorstore_url: str
    db_uri: str
    db_name: str
    openai_api_key: str
    appy_api_key: str
    cors_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env")


@lru_cache()
def appy_settings():
    return AppySettings()
