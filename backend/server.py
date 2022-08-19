# TODO: refactor setup to different files
from typing import List
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from main import process_data_for_all_tenants
from dotenv import load_dotenv

load_dotenv()

from beanie import Document, init_beanie
import motor, os

class Test(Document):
    name: str

    class Settings:
        name = "test"


class TestResponse(Test):
    class Config:
        fields = {'id': 'id'}

    def __init__(self, **pydict):
        super().__init__(**pydict)
        self.id = pydict.get('_id')

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

@app.on_event("startup")
async def startup_event():
    client = motor.motor_asyncio.AsyncIOMotorClient(os.environ.get("DB_URI"))
    await init_beanie(database=client.apperture_db, document_models=[Test])

@app.post("/data/providers")
def trigger(background_tasks: BackgroundTasks):
    background_tasks.add_task(process_data_for_all_tenants)
    return {"submitted": True}

@app.get("/test", response_model=List[TestResponse], response_model_by_alias=False)
async def test():
    return await Test.find().to_list()
