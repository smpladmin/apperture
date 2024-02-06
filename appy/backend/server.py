import logging
from dotenv import load_dotenv

from mongo import Mongo
from settings import appy_settings
from vectorstore import VectorStore
from rest.controllers import knowledge, chat
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from contextlib import asynccontextmanager

logging.getLogger().setLevel(logging.INFO)
load_dotenv()

settings = appy_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    FastAPICache.init(InMemoryBackend())
    vectorstore = VectorStore()
    mongo = Mongo()
    app.dependency_overrides[VectorStore] = lambda: vectorstore
    vectorstore.init()
    await mongo.init()
    # await connection_pool.init()
    yield {"vectorstore": vectorstore}
    vectorstore: VectorStore = app.dependency_overrides[VectorStore]()
    vectorstore.close()
    await mongo.close()
    # await connection_pool.close()


app = FastAPI(
    title="Appy Server",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(knowledge.router)


@app.get("/")
async def appy():
    return {"message": "Hey I'm Appy!"}
