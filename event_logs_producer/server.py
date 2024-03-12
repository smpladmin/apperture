import json
import logging
import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiokafka import AIOKafkaProducer
from dotenv import load_dotenv

from cache import init_cache
from domain.event_logs.models import EventLogsDto
from domain.event_logs.service import EventLogsService
from rest.middlewares.validate_app_api_key import (
    validate_app_api_key,
)
from jsonpath_ng import parse

load_dotenv()
logging.getLogger().setLevel(logging.INFO)


# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
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
    init_cache(redis_host=REDIS_HOST, redis_password=REDIS_PASSWORD)
    await producer.start()


@app.on_event("shutdown")
async def shutdown_event():
    await producer.stop()


def match_event_to_config(event, config):
    matched_tables = set()

    for config_item in config:

        event_name_match = config_item["event"] == event["eventName"]
        id_path_expr = parse(config_item["id_path"])
        id_path_values = [match.value for match in id_path_expr.find(event)]

        values_present_and_not_empty = bool(id_path_values) and all(
            value is not None and value != "" for value in id_path_values
        )
        if event_name_match and values_present_and_not_empty:
            matched_tables.add(config_item["destination_table"])
    return list(matched_tables)


@app.post(
    "/eventlogs",
    dependencies=[Depends(validate_app_api_key)],
)
async def capture_event_logs(
    datasource_id: str, dto: EventLogsDto, service: EventLogsService = Depends()
):
    kafka_topic = f"eventlogs_{datasource_id}"
    # update data with datasource_id to track apperture datasource associated with log stream
    event = {
        "eventName": dto.event.eventName,
        "addedTime": dto.event.addedTime,
        "table": dto.event.table,
        "mobile": dto.event.mobile or "",
        "task_id": dto.event.task_id or "",
        "account_id": dto.event.account_id or "",
        "key": dto.event.key or "",
        "data": dto.event.data,
        "datasource_id": datasource_id,
    }
    value = json.dumps(event)

    config = await service.get_config_for_datasource(datasource_id=datasource_id)
    if config:
        logging.info(f"event config:--- {config}")
        event_config = config.get("event_source_destination_config", [])
        # Match event to config and send to corresponding Kafka topics
        matched_tables = match_event_to_config(event=event, config=event_config)
        for table in matched_tables:
            table_topic = f"eventlogs_{datasource_id}_{table}"
            logging.info(f"Sending event {event} to Kafka topic: {table_topic}")
            await producer.send_and_wait(table_topic, value=value.encode("utf-8"))

    logging.info(f"Sending event {event} to default Kafka topic: {kafka_topic}")
    await producer.send_and_wait(kafka_topic, value=value.encode("utf-8"))
    return {"status": "ok"}
