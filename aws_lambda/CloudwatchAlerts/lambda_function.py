import json
import logging
import os
import datetime
import gzip

from base64 import b64decode
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from datetime import datetime, timedelta

logger = logging.getLogger()
logger.setLevel(logging.INFO)


## Defining global constants
class Constants:
    LOG_CLICKSTREAM = "Clickstream Events"
    LOG_EVENT_LOGS = "EventLogs"
    LOG_CONFIG = "Event Config"

    LOG_NAME = "SERVICE_NAME"
    SLACK_URLS = "SLACK_URLS"
    LAST_ALERT_TIME = "LAST_ALERT_TIME"

    ERROR = "Error"
    WARNING = "Warning"
    INFO = "Info"
    LOG_TYPES = (ERROR, WARNING, INFO)


# The base-64 encoded, encrypted key (CiphertextBlob) stored in the kmsEncryptedHookUrl environment variable
CDC_INTERNAL_ALERTS_URL = os.environ["kmsEncryptedHookCdcInternalAlerts"]
WIOM_CDC_ALERTS_URL = os.environ["kmsEncryptedHookWiomCdcAlerts"]
WARNING_ALERTS_URL = os.environ["kmsEncryptedHookWarningAlerts"]
CONFIG_CHANNEL_URL = os.environ["kmsEncryptedHookConfigChannel"]


# Warning Messages
WARNING_MESSAGES = [
    "Failed fetch messages from",
    "Heartbeat session expired - marking coordinator dead",
]
# Info Messages
INFO_MESSAGES = [
    "Starting Consumer Server",
    "group_coordinator:Joined group",
]

# Throttling interval (5 minutes)
THROTTLING_INTERVAL = timedelta(minutes=5)

# Log Config
log_config = {
    "apperture-prod-events-log-group": {
        Constants.LOG_NAME: Constants.LOG_CLICKSTREAM,
        Constants.SLACK_URLS: {
            Constants.ERROR: [CDC_INTERNAL_ALERTS_URL],
            Constants.WARNING: [WARNING_ALERTS_URL],
            Constants.INFO: [CDC_INTERNAL_ALERTS_URL],
        },
        Constants.LAST_ALERT_TIME: {
            Constants.ERROR: datetime.min,
            Constants.WARNING: datetime.min,
            Constants.INFO: datetime.min,
        },
    },
    "apperture-prod-eventlogs-log-group": {
        Constants.LOG_NAME: Constants.LOG_EVENT_LOGS,
        Constants.SLACK_URLS: {
            Constants.ERROR: [CDC_INTERNAL_ALERTS_URL, WIOM_CDC_ALERTS_URL],
            Constants.WARNING: [WARNING_ALERTS_URL],
            Constants.INFO: [CDC_INTERNAL_ALERTS_URL, WIOM_CDC_ALERTS_URL],
        },
        Constants.LAST_ALERT_TIME: {
            Constants.ERROR: datetime.min,
            Constants.WARNING: datetime.min,
            Constants.INFO: datetime.min,
        },
    },
    "apperture-prod-eventconfig-group": {
        Constants.LOG_NAME: Constants.LOG_CONFIG,
        Constants.SLACK_URLS: {
            Constants.ERROR: [CDC_INTERNAL_ALERTS_URL, WIOM_CDC_ALERTS_URL, CONFIG_CHANNEL_URL],
            Constants.WARNING: [WARNING_ALERTS_URL],
            Constants.INFO: [CDC_INTERNAL_ALERTS_URL, WIOM_CDC_ALERTS_URL, CONFIG_CHANNEL_URL],
        },
        Constants.LAST_ALERT_TIME: {
            Constants.ERROR: datetime.min,
            Constants.WARNING: datetime.min,
            Constants.INFO: datetime.min,
        },
    },
}


def lambda_handler(event, context):
    logger.info("Event: " + str(event))

    # Decompress Log Data
    logs_data = event["awslogs"]["data"]
    decoded_data = b64decode(logs_data)
    decompressed_data = gzip.decompress(decoded_data).decode("utf-8")
    # print(decompressed_data)

    # Decompress Log Data
    log_data = json.loads(decompressed_data)

    # Extracting logGroup
    log_group = log_data["logGroup"]
    log_events = log_data["logEvents"]

    # Segregating messages of different types (error, warning and info)
    segregated_messages = segregate_messages_based_on_log_type(log_events)

    # sending messages
    send_message_of_log_group(log_group, segregated_messages)


def segregate_messages_based_on_log_type(log_events: list):
    segregated_messages = {}
    for log_type in Constants.LOG_TYPES:
        segregated_messages[log_type] = set()

    ## Segregating messages of different types (error, warning and info)
    for log_event in log_events:
        # Extract log message
        log_message = log_event["message"]
        # Checking if it is an waring message
        is_warning_message = False
        for warning_message in WARNING_MESSAGES:
            if warning_message in log_message:
                is_warning_message = True
                break
        # Checking if it is an info message
        is_info_message = False
        for info_message in INFO_MESSAGES:
            if info_message in log_message:
                is_info_message = True
                break
        # Adding in respective set
        if is_info_message:
            segregated_messages[Constants.INFO].add(log_message)
        elif is_warning_message:
            segregated_messages[Constants.WARNING].add(log_message)
        else:
            segregated_messages[Constants.ERROR].add(log_message)

    return segregated_messages


def send_message_of_log_group(log_group: str, segregated_messages: dict):
    global log_config
    log_details = log_config[log_group]

    for log_type, messages in segregated_messages.items():
        # Extracting details
        log_name = log_details[Constants.LOG_NAME]
        slack_urls = log_details[Constants.SLACK_URLS][log_type]
        last_alert_time = log_details[Constants.LAST_ALERT_TIME][log_type]

        # Checking time since last log of this type
        if (
            len(messages) > 0
            and (datetime.now() - last_alert_time) >= THROTTLING_INTERVAL
        ):
            # Sending message
            send_message(slack_urls, messages, log_name, log_group, log_type)
            # Setting new last alert time
            log_details[Constants.LAST_ALERT_TIME][log_type] = datetime.now()


def send_message(
    slack_urls: list,
    messages: list,
    log_name: str,
    log_group: str,
    log_type: str,
) -> None:
    # Create combined message
    if len(messages) > 0:
        log_message = "\n".join(list(messages))
        log_type_in_message = log_type + " (Start/Restart)" if log_type == Constants.INFO else log_type

        slack_message = {
            "channel": "slack_channel",
            "text": f"*Alert - {log_name}* \n\n_Log group:_ {log_group}\n_Log type:_ {log_type_in_message}\n\n{log_message}",
        }

        # Message to each slack url
        for slack_url in slack_urls:
            try:
                req = Request(slack_url, json.dumps(slack_message).encode("utf-8"))
                response = urlopen(req)
                response.read()
                logger.info("Message posted to %s", slack_url)
            except HTTPError as e:
                logger.error("Request failed: %d %s", e.code, e.reason)
            except URLError as e:
                logger.error("Server connection failed: %s", e.reason)
            except Exception:
                logger.exception("Error Occured")
