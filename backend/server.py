import logging
import os

from dotenv import load_dotenv

from cache import init_cache
from clickhouse.clickhouse_client_factory import ClickHouseClientFactory
from settings import apperture_settings

load_dotenv(override=False)
logging.getLogger().setLevel(logging.INFO)

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from clickhouse import Clickhouse
from mongo import Mongo
from rest.controllers import (
    action_controller,
    api_key_controller,
    app_controller,
    apperture_user_controller,
    auth_controller,
    cdc_controller,
    clickstream_controller,
    connection_controller,
    data_processor_controller,
    datamart_controller,
    datasource_controller,
    event_capture_controller,
    funnel_controller,
    google_sheet_controller,
    integration_controller,
    integration_oauth_controller,
    metric_controller,
    notification_controller,
    private_apis_controller,
    retention_controller,
    schedule_controller,
    segment_controller,
    spreadsheet_controller,
    user_controller,
)

settings = apperture_settings()

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=settings.traces_sample_rate,
        _experiments={
            "profiles_sample_rate": settings.profiles_sample_rate,
        },
        environment=settings.sentry_environment,
    )


async def on_startup():
    mongo = Mongo()
    ClickHouseClientFactory()
    clickhouse = Clickhouse()
    app.dependency_overrides[Mongo] = lambda: mongo
    app.dependency_overrides[Clickhouse] = lambda: clickhouse
    await mongo.init()
    clickhouse.init()
    init_cache(settings.redis_host, settings.redis_password)


async def on_shutdown():
    mongo: Mongo = app.dependency_overrides[Mongo]()
    clickhouse: Clickhouse = app.dependency_overrides[Clickhouse]()
    await mongo.close()
    clickhouse.close()
    ClickHouseClientFactory.close_all_client_connection()


app = FastAPI(on_startup=[on_startup], on_shutdown=[on_shutdown])


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SESSION_SECRET"))
app.include_router(auth_controller.router)
app.include_router(app_controller.router)
app.include_router(integration_oauth_controller.router)
app.include_router(integration_controller.router)
app.include_router(private_apis_controller.router)
app.include_router(data_processor_controller.router)
app.include_router(datasource_controller.router)
app.include_router(schedule_controller.router)
app.include_router(notification_controller.router)
app.include_router(apperture_user_controller.router)
app.include_router(funnel_controller.router)
app.include_router(segment_controller.router)
app.include_router(metric_controller.router)
app.include_router(user_controller.router)
app.include_router(action_controller.router)
app.include_router(event_capture_controller.router)
app.include_router(clickstream_controller.router)
app.include_router(retention_controller.router)
app.include_router(spreadsheet_controller.router)
app.include_router(datamart_controller.router)
app.include_router(connection_controller.router)
app.include_router(api_key_controller.router)
app.include_router(google_sheet_controller.router)
app.include_router(cdc_controller.router)


@app.get("/sentry-debug")
async def trigger_error():
    division_by_zero = 1 / 0
