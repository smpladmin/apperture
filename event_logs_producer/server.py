import json
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv

load_dotenv()
logging.getLogger().setLevel(logging.INFO)


# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")

producer = None

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.post("/event_logs/capture/{datasource_id}")
async def capture_event_logs(
    datasource_id: str,
    data: dict,
):
    kafka_topic = f"event_logs_{datasource_id}"
    # update data with datasource_id to track apperture datasource associated with log stream
    data.update({"datasource_id": datasource_id})
    value = json.dumps(data)

    await producer.send_and_wait(kafka_topic, value=value.encode("utf-8"))
    return {"status": "ok"}
