import os
from typing import Union

from fastapi import FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaProducer


ROOT_DIR = os.path.abspath(os.curdir)
array = open(f"{ROOT_DIR}/static/array.js", "r").read()
array_map = open(f"{ROOT_DIR}/static/array.js.map", "r").read()


# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = "kafka:9092"
KAFKA_TOPIC = "clickstream"


producer = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    global producer
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
    )
    await producer.start()


@app.on_event("shutdown")
async def shutdown_event():
    await producer.stop()


@app.post("/events/capture/e/")
async def capture_event(
    ip: str,
    _: str,
    ver: str,
    data: Union[str, None] = Form(...),
) -> None:
    """Capture an event and send it to Kafka."""
    await producer.send_and_wait(KAFKA_TOPIC, value=data.encode("utf-8"))
    return {"status": "ok"}


@app.post("/events/capture/decide/")
async def analyse_decide_call(
    v: str,
    ip: str,
    _: str,
    ver: str,
):
    return {"config": {"enable_collect_everything": True}, "sessionRecording": False}


@app.get("/events/capture/static/array.js")
async def get_js_sdk():
    return Response(array, media_type="application/javascript; charset=UTF-8")


@app.get("/events/capture/static/array.js.map")
async def get_js_sdk_map():
    return Response(array_map)
