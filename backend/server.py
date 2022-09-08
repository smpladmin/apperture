import os
from dotenv import load_dotenv

load_dotenv(override=False)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from rq import Queue
from redis import Redis

redis_conn = Redis(host=os.getenv("REDIS_HOST"), password=os.getenv("REDIS_PASSWORD"))
q = Queue(connection=redis_conn)

from rest.controllers import (
    app_controller,
    auth_controller,
    integration_controller,
    integration_oauth_controller,
)
from mongo import Mongo


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


@app.post("/data/providers", status_code=202)
def trigger():
    job = q.enqueue("main2.test", "test argument")
    return {"submitted": True, "job_id": job.id}
