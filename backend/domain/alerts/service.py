from datetime import datetime
import logging
import gzip
import json
import re

from typing import Optional, Union

import requests
from domain.alerts.models import (
    Alert,
    AlertType,
    EmailChannel,
    Schedule,
    SlackChannel,
    Threshold,
)
from mongo import Mongo
from fastapi import Depends
from beanie import PydanticObjectId
import os

from base64 import b64decode


class AlertService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
    ):
        self.mongo = mongo
        self.apperture_slack_url = os.environ.get("APPERTURE_SLACK_URL")

    def build_alert_config(
        self,
        datasource_id: PydanticObjectId,
        type: AlertType,
        schedule: Optional[Schedule],
        channel: Union[SlackChannel, EmailChannel],
        threshold: Threshold,
    ) -> Alert:
        return Alert(
            datasource_id=datasource_id,
            type=type,
            schedule=schedule,
            channel=channel,
            threshold=threshold,
        )

    async def save_alert_config(self, alert: Alert):
        return await Alert.insert(alert)

    async def update_alert_config(
        self,
        id: str,
        alert: Alert,
    ):
        to_update = alert.dict()
        to_update.pop("id")
        to_update.pop("created_at")
        to_update["updated_at"] = datetime.utcnow()

        await Alert.find_one(
            Alert.id == PydanticObjectId(id),
        ).update({"$set": to_update})

    async def get_alert_config_for_datasource(self, datasource_id: str):
        return await Alert.find(
            Alert.datasource_id == PydanticObjectId(datasource_id),
            Alert.enabled == True,
        ).to_list()

    async def get_alert_for_datasource_id_with_alert_type(
        self, datasource_id: str, alert_type: str
    ) -> Alert:
        return await Alert.find_one(
            Alert.datasource_id == PydanticObjectId(datasource_id),
            Alert.type == alert_type,
            Alert.enabled == True,
        )

    async def get_alerts(self):
        return await Alert.find(
            Alert.enabled == True,
        ).to_list()

    def get_intergation_id_from_cdc_error_log(self, log: str):
        id_pattern = re.compile(r"cdc_(\w+)")
        match = id_pattern.search(log)

        if match:
            extracted_id = match.group(1)
            return extracted_id
        else:
            return None

    def get_error_message(self, log: str):
        error_index = log.find("ERROR")
        return log[error_index + len("ERROR") :].strip()

    def post_message_to_slack(
        self, slack_url: str, message: str, alert_type: AlertType
    ):
        payload = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"Alert - {alert_type}:zap:",
                    "emoji": True,
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": message,
                },
            },
        ]
        try:
            requests.post(
                slack_url,
                json={
                    "blocks": payload,
                },
            )
        except Exception as e:
            logging.log(f"Failed to send alert to Slack {slack_url}")
        return

    def extract_cdc_logs_by_integration_id(self, logs_data: str):
        decoded_data = b64decode(logs_data)
        decompressed_data = gzip.decompress(decoded_data).decode("utf-8")

        log_events = json.loads(decompressed_data)["logEvents"]
        logs_by_integration_id = {}

        for log_event in log_events:
            integration_id = self.get_intergation_id_from_cdc_error_log(
                log_event["message"]
            )
            error_message = self.get_error_message(log_event["message"])
            if integration_id:
                logs_by_integration_id.setdefault(integration_id, set()).add(
                    error_message
                )
            else:
                # post anonymous error to internal slack channel
                self.post_message_to_slack(
                    slack_url=self.apperture_slack_url,
                    message=self.get_error_message(log_event["message"]),
                    alert_type=AlertType.CDC_ERROR,
                )

        return {k: list(v) for k, v in logs_by_integration_id.items()}
