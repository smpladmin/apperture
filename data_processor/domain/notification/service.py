import logging
import os
from typing import List
from pydantic import parse_obj_as

import requests
from apperture.backend_action import get
from domain.notification.models import Notification, NotificationChannel


class NotificationService:
    def fetch_notifications(self, user_id: str):
        response = get(f"/private/compute_notifications/{user_id}")
        if response.ok:
            return parse_obj_as(List[Notification], response.json())

        raise Exception(f"Error fetching notifications for user {user_id}")

    def send_notification(
        self, notifications: List[Notification], channel: NotificationChannel
    ):
        logging.info(f"Sending {notifications} to {channel}")
        text = "\n".join([f"{n.name}, {n.value}" for n in notifications])
        response = requests.post(
            os.environ.get("SLACK_URL"),
            json={
                "attachments": [
                    {
                        "color": "#9733EE",
                        "fields": [
                            {
                                "title": "Here is your update! :zap:",
                                "value": text,
                                "short": "false",
                            }
                        ],
                    }
                ],
            },
        )
        logging.info(f"Sent notification with status {response.status_code}")
