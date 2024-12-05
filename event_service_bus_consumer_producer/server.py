import asyncio
import json
import logging
import os
from datetime import datetime
from aiokafka import AIOKafkaProducer
from azure.servicebus.aio import ServiceBusClient
from azure.servicebus import ServiceBusReceiveMode
from dotenv import load_dotenv
from domain.event_logs.models import EventLogsDto

# Environment setup
load_dotenv()
logging.getLogger().setLevel(logging.INFO)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092").split(",")
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
logging.info(f"KAFKA_BOOTSTRAP_SERVERS: {KAFKA_BOOTSTRAP_SERVERS}")


# Event Logs configuration
START_TIME=os.getenv("START_TIME")
LOG_KAFKA_TOPIC=os.getenv("LOG_KAFKA_TOPIC", "eventlogs_event_service_bus")
DATASOURCE_ID=os.getenv("DATASOURCE_ID", "event_service_bus")
CONFIG_KAFKA_TOPIC=os.getenv("CONFIG_KAFKA_TOPIC", "config_events_1_event_service_bus")

# Azure Service Bus configuration
NAMESPACE_CONNECTION_STR = os.getenv("NAMESPACE_CONNECTION_STR")
SUBSCRIPTION_NAME = os.getenv("SUBSCRIPTION_NAME")
TOPIC_NAME = os.getenv("TOPIC_NAME", "log_events")

logging.info(f"SUBSCRIPTION_NAME : {SUBSCRIPTION_NAME}")
logging.info(f"TOPIC_NAME : {TOPIC_NAME}")

AZURE_BATCH_SIZE = int(os.getenv("AZURE_BATCH_SIZE", 50))
AZURE_MAX_WAIT_TIME = int(os.getenv("AZURE_MAX_WAIT_TIME", 5))
AZURE_NO_MESSAGE_DELAY = int(os.getenv("AZURE_NO_MESSAGE_DELAY", 2))
CONFIG_KAFKA_TABLES = os.getenv("CONFIG_KAFKA_TABLES","")
CONFIG_KAFKA_TABLES_LIST = [table.strip().replace("'", "").replace('"', "") for table in CONFIG_KAFKA_TABLES.split(",")]
TABLES_TO_SKIP = os.getenv("TABLES_TO_SKIP","")
TABLES_TO_SKIP_LIST = [table.strip().replace("'", "").replace('"', "") for table in TABLES_TO_SKIP.split(",")]

producer = None

def format_date_string_to_desired_format(
    date_str: str, output_date_format="%Y-%m-%d %H:%M:%S"
):
    if not date_str:
        return
 
    date_formats = [
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%d %H:%M:%S",
        "%d-%m-%Y %H:%M",
        "%Y-%m-%d",
        "%Y-%m-%dT%H:%M:%S%z"
    ]

    for date_format in date_formats:
        try:
            if (
                "%f" in date_format
                and "." in date_str
                and len(date_str.split(".")[-1]) > 6
            ):
                milliseconds_part = date_str.split(".")[-1]
                digits_to_remove = len(milliseconds_part) - 6
                date_str = date_str[:-digits_to_remove]
            dt_object = datetime.strptime(date_str, date_format)
            result_date_str = dt_object.strftime(output_date_format)
            return datetime.strptime(result_date_str, output_date_format)
        except ValueError as e:
            pass

    return None

async def startup_event():
    global producer
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        max_request_size=5242880,
    )
    await producer.start()
    logging.info("Kafka producer started.")

async def shutdown_event():
    if producer:
        await producer.stop()
        logging.info("Kafka producer stopped.")

async def proccess_message(
    message_dict
):
    dto = EventLogsDto.parse_obj(message_dict["payload"])

    if START_TIME is not None and START_TIME != "":
        datetime_of_event = format_date_string_to_desired_format(dto.event.addedTime)
        datetime_threshold = format_date_string_to_desired_format(START_TIME)
        
        if datetime_of_event < datetime_threshold:
            logging.info(f"Skipping as this event is an older that the datetime threshold mentioned in env")
            return True
    
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
        "datasource_id": DATASOURCE_ID,
        "source_flag": "event_service_bus",
    }
    value = json.dumps(event)
    
    try:
        # If event's table in TABLES_TO_SKIP_LIST, then skipping event
        if dto.event.table in TABLES_TO_SKIP_LIST:
            logging.info(f"Skipping this event as table is: {dto.event.table} and TABLES_TO_SKIP_LIST is: {TABLES_TO_SKIP_LIST}. Event is: {event}")
            return True
        
        # Sending events to KAFKA - LOG TOPIC
        await producer.send_and_wait(LOG_KAFKA_TOPIC, value=value.encode("utf-8"))
        logging.info(f"Sending event {event} to log kafka topic: {LOG_KAFKA_TOPIC}")

        # Selectively sending events to KAFKA - CONFIG TOPIC
        if dto.event.table in CONFIG_KAFKA_TABLES_LIST:
            await producer.send_and_wait(CONFIG_KAFKA_TOPIC, value=value.encode("utf-8"))
            logging.info(f"Sending event {event} to config kafka topic: {CONFIG_KAFKA_TOPIC}")
        else:
            logging.info(f"Skipping config kafka as table is: {dto.event.table} and CONFIG_KAFKA_TABLES_LIST is: {CONFIG_KAFKA_TABLES_LIST}")
        
        logging.info(f"Successfully wrote event to kafka topics")

        return True
    except Exception as e:
        logging.error(f"Error writing message to kafka: {str(e)}")

        return False


async def receive_servicebus_messages():
    # create a Service Bus client using the connection string
    async with ServiceBusClient.from_connection_string(
        conn_str=NAMESPACE_CONNECTION_STR,
        logging_enable=True) as servicebus_client:

        async with servicebus_client:
            # get the Subscription Receiver object for the subscription
            receiver = servicebus_client.get_subscription_receiver(
                topic_name=TOPIC_NAME, 
                subscription_name=SUBSCRIPTION_NAME, 
                max_wait_time=AZURE_MAX_WAIT_TIME,
                receive_mode=ServiceBusReceiveMode.PEEK_LOCK,
            )
            async with receiver:
                while True:
                    received_msgs = await receiver.receive_messages(max_wait_time=AZURE_MAX_WAIT_TIME, max_message_count=AZURE_BATCH_SIZE)
                    if not received_msgs:
                        logging.info("No new messages, waiting")
                        await asyncio.sleep(AZURE_NO_MESSAGE_DELAY)
                        continue
                    for message in received_msgs:
                        message_dict = json.loads(str(message))
                        success_flag = await proccess_message(message_dict)
                        if success_flag:
                            logging.info(f"proccess_message flag: {success_flag}")
                            await receiver.complete_message(message)

async def main():
    await startup_event()
    try:
        await receive_servicebus_messages()
    finally:
        await shutdown_event()

if __name__ == "__main__":
    asyncio.run(main())
