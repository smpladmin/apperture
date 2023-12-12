import json
import os
from typing import Union

from fastapi import FastAPI, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv

from starlette.types import Message
from starlette.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware
import gzip
from models import FlutterBatchData

load_dotenv()


ROOT_DIR = os.path.abspath(os.curdir)
array = open(f"{ROOT_DIR}/static/array.js", "r").read()
array_map = open(f"{ROOT_DIR}/static/array.js.map", "r").read()


# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = "kafka:9092"
KAFKA_TOPIC = "clickstream"


producer = None


class GZipedMiddleware(BaseHTTPMiddleware):
    async def set_body(self, request: Request):
        receive_ = await request._receive()
        if (
            "gzip" in request.headers.getlist("Content-Encoding")
            and "/events/capture/batch" in request.url.path
        ):
            data = gzip.decompress(receive_.get("body"))
            receive_["body"] = data

        async def receive() -> Message:
            return receive_

        request._receive = receive

    async def dispatch(self, request, call_next):
        await self.set_body(request)
        response = await call_next(request)
        return response


app = FastAPI()

allowed_origins = [
    "https://app.apperture.io",
    "http://app.apperture.io",
    "https://api.apperture.io",
    "http://api.apperture.io",
    "https://www.parallelhq.com",
    "https://www.sangeethamobiles.com",
    "https://sangeethamobiles.com",
    "https://urbanmonkey.com",
    "https://www.urbanmonkey.com",
    "https://www.gotoexperts.co",
    "https://sangeetha.bangalore2.com",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGIN", allowed_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "HEAD"],
    allow_headers=["*"],
)

app.add_middleware(GZipedMiddleware)


@app.on_event("startup")
async def startup_event():
    global producer
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        max_request_size=5242880,
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
    ip: Union[str, None] = None,
    _: Union[str, None] = None,
    ver: Union[str, None] = None,
):
    response = {
        "config": {"enable_collect_everything": True},
        "sessionRecording": False,
    }
    if v == "2":
        response.update(
            {
                "toolbarParams": {},
                "isAuthenticated": False,
                "supportedCompression": ["gzip", "gzip-js"],
                "featureFlags": {},
                "capturePerformance": False,
                "autocapture_opt_out": False,
                "autocaptureExceptions": False,
                "surveys": False,
                "siteApps": [],
                "elementsChainAsString": False,
            }
        )
    return response


@app.post("/events/capture/batch")
async def capture_click_stream(
    data: FlutterBatchData,
):
    """Capture an event and send it to Kafka."""
    kafka_topic = "flutter_eventstream"
    value = json.dumps(data.dict())
    await producer.send_and_wait(kafka_topic, value=value.encode("utf-8"))
    return {"status": "ok"}


@app.get("/events/capture/static/array.js")
async def get_js_sdk():
    return Response(array, media_type="application/javascript; charset=UTF-8")


@app.get("/events/capture/static/array.js.map")
async def get_js_sdk_map():
    return Response(array_map)
