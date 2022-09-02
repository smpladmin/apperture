import os
from dotenv import load_dotenv

load_dotenv(override=False)

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from rest.controllers import (
    app_controller,
    auth_controller,
    integration_controller,
    integration_oauth_controller,
)
from mongo import Mongo
from main import process_data_for_all_tenants


async def on_startup():
    mongo = Mongo()
    app.dependency_overrides[Mongo] = lambda: mongo
    await mongo.init()


async def on_shutdown():
    mongo: Mongo = app.dependency_overrides[Mongo]()
    await mongo.close()


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


@app.post("/data/providers")
def trigger(background_tasks: BackgroundTasks):
    background_tasks.add_task(process_data_for_all_tenants)
    return {"submitted": True}
