import logging
from typing import Optional, Union

import requests
from domain.alerts.models import Alert, AlertType, EmailChannel, Schedule, SlackChannel
from mongo import Mongo
from fastapi import Depends
from beanie import PydanticObjectId


class AlertService:
    def __init__(
        self,
        mongo: Mongo = Depends(),
    ):
        self.mongo = mongo

    def build_alert_config(
        self,
        datasource_id: PydanticObjectId,
        type: AlertType,
        schedule: Optional[Schedule],
        channel: Union[SlackChannel, EmailChannel],
    ) -> Alert:
        return Alert(
            datasource_id=datasource_id,
            type=type,
            schedule=schedule,
            channel=channel,
        )

    async def save_alert_config(self, alert: Alert):
        return await Alert.insert(alert)

    async def get_alert_config_for_datasource(self, datasource_id: str):
        return await Alert.find_one(
            Alert.datasource_id == PydanticObjectId(datasource_id),
            Alert.enabled == True,
        )

    async def get_alerts(self):
        return await Alert.find(
            Alert.enabled == True,
        ).to_list()

    async def get_scheduled_alerts(self):
        return await Alert.find(
            Alert.type == AlertType.SCHEDULED,
            Alert.enabled == True,
        ).to_list()

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
                    "text": f"{message}. Kindly check your database connection or cdc access for your database.",
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
