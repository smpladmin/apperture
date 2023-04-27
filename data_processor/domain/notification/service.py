import json
import logging
from typing import List
from pydantic import parse_obj_as

import requests
from apperture.backend_action import get
from domain.notification.models import (
    Notification,
    NotificationChannel,
    NotificationType,
    NotificationVariant,
    NotificationThresholdType,
)


class NotificationService:
    def fetch_notifications(self, user_id: str):
        response = get(f"/private/notifications?user_id={user_id}")

        if response.ok:
            return parse_obj_as(List[Notification], response.json())

        raise Exception(f"Error fetching notifications for user {user_id}")

    def fetch_slack_url(self, user_id: str):
        response = get(f"/private/users/{user_id}")
        if response.ok and json.loads(response.text).get("slackUrl"):
            slack_url = json.loads(response.text).get("slackUrl")
            logging.info(f"Got slack url: {slack_url} for user: {user_id}")
            return slack_url

        raise Exception(f"Error fetching slack url for user {user_id}")

    def get_value_change_text(self, value: float):
        return f"{abs(value)}% higher" if value > 0 else f"{abs(value)}% lower"

    def get_original_value_text(self, value: float, variant: NotificationVariant):
        return f"{value}%" if variant == NotificationVariant.FUNNEL else f"{value}"

    def send_updates(self, updates: List[Notification], slack_url: str):
        text = "\n".join(
            [
                f'"{u.name}" {u.variant} was {self.get_original_value_text(u.original_value, u.variant)} yesterday. This was {self.get_value_change_text(u.value)} compared to previous day.'
                for u in updates
            ]
        )
        response = requests.post(
            slack_url,
            json={
                "attachments": [
                    {
                        "color": "#9733EE",
                        "fields": [
                            {
                                "title": "Here is an update! :zap:",
                                "value": text,
                                "short": "false",
                            }
                        ],
                    }
                ],
            },
        )
        logging.info(f"Sent updates with status {response.status_code}")

    def get_alert_threshold_text(self, alert: Notification):
        # Set the message and threshold based on the type of threshold set for the notification alert
        if alert.threshold_type == NotificationThresholdType.PCT:
            message = "increased" if alert.value > 0 else "reduced"
            threshold = abs(alert.value)
        else:
            if alert.value > alert.user_threshold.max:
                message = "went above"
                threshold = alert.user_threshold.max
            else:
                message = "dropped below"
                threshold = alert.user_threshold.min

        if alert.threshold_type == NotificationThresholdType.PCT:
            return f"{message} by more than {threshold}% yesterday"
        else:
            return (
                f"{message} {threshold}% yesterday"
                if alert.variant == NotificationVariant.FUNNEL
                else f"{message} {threshold} yesterday"
            )

    def send_alerts(self, alerts: List[Notification], slack_url: str):
        text = text = "\n".join(
            [
                f'Alert! "{alert.name}" {self.get_alert_threshold_text(alert=alert)}'
                for alert in alerts
            ]
        )
        response = requests.post(
            slack_url,
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
        logging.info(
            f"Sent alert with status {response.status_code}"
        ) if response.ok else logging.info(
            f"Failed to send alert with status {response.status_code}"
        )

    def send_notification(
        self,
        notifications: List[Notification],
        channel: NotificationChannel,
        slack_url: str,
    ):
        logging.info(f"Sending {notifications} to {channel}")
        updates = [
            n for n in notifications if n.notification_type == NotificationType.UPDATE
        ]
        alerts = [
            n
            for n in notifications
            if n.notification_type == NotificationType.ALERT and n.triggered
        ]
        self.send_updates(updates, slack_url)
        self.send_alerts(alerts, slack_url)

        logging.info("Sent notifications")
