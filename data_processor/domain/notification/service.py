import logging
import os
from typing import List
from pydantic import parse_obj_as

import requests
from apperture.backend_action import get
from domain.notification.models import (
    Notification,
    NotificationChannel,
    NotificationType,
)


class NotificationService:
    def fetch_notifications(self, user_id: str):
        response = get(f"/private/notifications?user_id={user_id}")
        if response.ok:
            return parse_obj_as(List[Notification], response.json())

        raise Exception(f"Error fetching notifications for user {user_id}")

    def send_updates(self, updates):
        text = "\n".join([f"name: {u.name}, \tvalue: {u.value}" for u in updates])
        response = requests.post(
            os.environ.get("SLACK_URL"),
            json={
                "attachments": [
                    {
                        "color": "#9733EE",
                        "fields": [
                            {
                                "title": "Here are your updates! :zap:",
                                "value": text,
                                "short": "false",
                            }
                        ],
                    }
                ],
            },
        )
        logging.info(f"Sent updates with status {response.status_code}")

    def send_alerts(self, alerts):
        for alert in alerts:
            text = (
                f"name: {alert.name}, \tvalue: {alert.value}, \tthreshold_type: {alert.thresholdType},"
                f" \tuser_threshold: {alert.userThreshold}"
            )
            response = requests.post(
                os.environ.get("SLACK_URL"),
                json={
                    "attachments": [
                        {
                            "color": "#9733EE",
                            "fields": [
                                {
                                    "title": "Here is your alert! :zap:",
                                    "value": text,
                                    "short": "false",
                                }
                            ],
                        }
                    ],
                },
            )
            logging.info(f"Sent alert with status {response.status_code}")

    def send_notification(
        self, notifications: List[Notification], channel: NotificationChannel
    ):
        logging.info(f"Sending {notifications} to {channel}")
        updates = [
            n for n in notifications if n.notificationType == NotificationType.UPDATE
        ]
        alerts = [
            n
            for n in notifications
            if n.notificationType == NotificationType.ALERT and n.triggered
        ]
        self.send_updates(updates)
        self.send_alerts(alerts)

        logging.info("Sent notifications")
