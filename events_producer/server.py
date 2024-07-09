import json
import logging
import os
from typing import List, Union, Callable

from fastapi import FastAPI, Form, HTTPException, Response, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv
from fastapi.routing import APIRoute

from starlette.types import Message
from starlette.requests import Request
from starlette.middleware.base import BaseHTTPMiddleware
import gzip
from models import (
    FlutterBatchData,
    GupshupDeliveryReportEvent,
    GupshupDeliveryReportEventObject,
    AgentLogEvent,
)

load_dotenv()
logging.getLogger().setLevel(logging.INFO)


ROOT_DIR = os.path.abspath(os.curdir)
array = open(f"{ROOT_DIR}/static/array.js", "r").read()
array_map = open(f"{ROOT_DIR}/static/array.js.map", "r").read()


# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")
KAFKA_TOPIC = "clickstream"


producer = None


class GzipRequest(Request):
    async def body(self) -> bytes:
        if not hasattr(self, "_body"):
            body = await super().body()
            if "gzip" in self.headers.getlist("Content-Encoding"):
                body = gzip.decompress(body)
            self._body = body
        return self._body


class GzipRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            request = GzipRequest(request.scope, request.receive)
            return await original_route_handler(request)

        return custom_route_handler


app = FastAPI()
app.router.route_class = GzipRoute

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


@app.post("/events/capture/agentlog/")
async def capture_agent_log_event(
    event: AgentLogEvent, request: Request, nexus_api_key: str = Header(None)
):
    try:
        headers = request.headers
        nexus_api_key = headers.get("nexus_api_key")
        event.datasource_id = nexus_api_key

        data = event.dict()

        kafka_topic = "agent_log"
        await producer.send_and_wait(
            kafka_topic, value=json.dumps(data).encode("utf-8")
        )

        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Error processing request: {str(e)}")
        raise


@app.post("/events/deliveryreport")
async def capture_delivery_report(
    payload: Union[List[GupshupDeliveryReportEvent], GupshupDeliveryReportEventObject]
):
    """Capture gupshup delivery report events and send them to kafka.
    Gupshup sends max 20 events at a time.
    """
    if isinstance(payload, list):
        events = payload
    elif isinstance(payload, GupshupDeliveryReportEventObject):
        events = payload.response
    else:
        raise HTTPException(status_code=400, detail="Invalid payload format")

    data = [e.dict() for e in events]

    await producer.send_and_wait(
        "gupshup_delivery_report", value=json.dumps(data).encode("utf-8")
    )
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
