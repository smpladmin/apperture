import logging
import os

import requests

from apperture.backend_action import post
from domain.datasource.service import DataSourceService
from domain.notification.models import NotificationFrequency, NotificationType
from strategies.strategy_builder import (
    EventsStrategyBuilder,
    NotificationStrategyBuilder,
    StrategyBuilder,
)

logging.getLogger().setLevel(logging.INFO)


ds_service = DataSourceService()


def process_data_for_datasource(ds_id: str):
    logging.info("{x}: {y}".format(x="process_data_for_datasource", y="starts"))
    logging.info("{x}: {y}".format(x="Process running for id", y=ds_id))

    res = ds_service.get_datasource_with_credential(ds_id)

    logging.info("{x}: {y}".format(x="Strategy Building", y="starts"))
    strategy = StrategyBuilder.build(
        res.datasource.provider,
        res.datasource.version,
        "",
        res.credential.refresh_token,
        ds_id,
    )
    logging.info("{x}: {y}".format(x="Strategy Building", y="ends"))

    logging.info("{x}: {y}".format(x="Strategy Execution", y="starts"))
    strategy.execute(
        res.credential.account_id,
        res.datasource.external_source_id,
    )

    logging.info("{x}: {y}".format(x="Strategy Execution", y="ends"))
    logging.info("{x}: {y}".format(x="process_data_for_datasource", y="ends"))


def process_event_data_for_datasource(ds_id: str, runlog_id: str, date: str):
    logging.info("{x}: {y}".format(x="process_event_data_for_datasource", y="starts"))
    logging.info("{x}: {y}".format(x="Process running for id", y=ds_id))

    res = ds_service.get_datasource_with_credential(ds_id)
    logging.info("{x}: {y}".format(x="Strategy Building", y="starts"))
    strategy = EventsStrategyBuilder.build(
        res.datasource, res.credential, runlog_id, date
    )
    logging.info("{x}: {y}".format(x="Strategy Building", y="ends"))
    logging.info("{x}: {y}".format(x="Strategy Execution", y="starts"))
    strategy.execute()
    logging.info("{x}: {y}".format(x="Strategy Execution", y="ends"))

    logging.info("{x}: {y}".format(x="process_event_data_for_datasource", y="ends"))


def trigger_data_processing():
    logging.info("{x}: {y}".format(x="Triggering data processing", y=""))
    headers = {
        f"{os.getenv('BACKEND_API_KEY_NAME')}": os.getenv("BACKEND_API_KEY_SECRET")
    }
    response = requests.post(
        f"{os.getenv('BACKEND_BASE_URL')}/private/datasources",
        headers=headers,
    )
    logging.info(
        "{x}: {y}".format(x="Triggered data processing, status", y=response.status_code)
    )


def trigger_notifications_processing(
    notification_type: NotificationType, frequency: NotificationFrequency
):
    logging.info("{x}: {y}".format(x="Triggering notifications processing", y=""))
    response = post(
        "/private/notifications",
        {"notification_type": notification_type, "frequency": frequency},
    )
    logging.info(
        "{x}: {y}".format(x="Triggered data processing, status", y=response.status_code)
    )


def send_notification(user_id: str):
    strategy = NotificationStrategyBuilder.build(user_id)
    strategy.execute()
