import logging
import os
from dotenv import load_dotenv

from cache import init_cache
from settings import apperture_settings

load_dotenv(override=False)
logging.getLogger().setLevel(logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from rest.controllers import (
    app_controller,
    apperture_user_controller,
    auth_controller,
    data_processor_controller,
    datasource_controller,
    integration_controller,
    integration_oauth_controller,
    private_apis_controller,
    schedule_controller,
    notification_controller,
    segment_controller,
    funnel_controller,
    metric_controller,
    user_controller,
    event_capture_controller,
)
from mongo import Mongo
from clickhouse import Clickhouse

settings = apperture_settings()


async def on_startup():
    mongo = Mongo()
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


app = FastAPI(on_startup=[on_startup], on_shutdown=[on_shutdown])


# TODO: allow only specific origins
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(event_capture_controller.router)
