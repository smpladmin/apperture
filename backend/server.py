import os
from fastapi import FastAPI, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv

from authorisation import controller as oauth_router
from mongo import Mongo
from main import process_data_for_all_tenants

load_dotenv(override=False)


app = FastAPI()

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
app.include_router(oauth_router.router)


@app.on_event("startup")
async def startup_event(mongo: Mongo = Depends()):
    mongo.init()


@app.post("/data/providers")
def trigger(background_tasks: BackgroundTasks):
    background_tasks.add_task(process_data_for_all_tenants)
    return {"submitted": True}
