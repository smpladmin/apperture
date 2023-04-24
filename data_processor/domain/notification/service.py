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
from fetch.notification_screenshot_fetcher import NotificationScreenshotFetcher
from store.notification_screenshot_saver import NotificationScreenshotSaver


class NotificationService:
    def __init__(self):
        self.fetcher = NotificationScreenshotFetcher()
        self.saver = NotificationScreenshotSaver()

    def build_notification_body(self, alert: Notification):
        url = self.fetch_screenshot_url(
            id=alert.reference, variant=alert.variant)
        text = (
            f'Alert! "{alert.name}" {self.get_alert_threshold_text(alert=alert)}'
            if alert.notification_type == NotificationType.ALERT
            else f'"{alert.name}" {alert.variant} was {self.get_original_value_text(alert.original_value, alert.variant)} yesterday. This was {self.get_value_change_text(alert.value)} compared to previous day.'
        )

        if url is not None:
            return {"type": "section", "text": {"type": "mrkdwn", "text": text}}, {"type": "image", "image_url": url, "alt_text": "A beautiful image", }
        else:
            {"type": "section", "text": {"type": "mrkdwn", "text": text}}

    def fetch_screenshot_url(self, id: str, variant: str):
        file, filename = self.fetcher.fetch_screenshot(id=id, variant=variant)
        if filename is not None:
            return self.saver(filename=filename, file=file)
        return None

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
        payload = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Here is an update :zap:",
                    "emoji": True,
                },
            }
        ]

        payload.extend(
            [
                item
                for items in [self.build_notification_body(update) for update in updates]
                for item in items
            ]
        )
        response = requests.post(
            slack_url,
            json={
                "blocks": payload,
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
        payload = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Here is an update :zap:",
                    "emoji": True,
                },
            }
        ]

        payload.extend(
            [
                item
                for items in [
                    self.build_notification_body(
                        alert,
                    )
                    for alert in alerts
                ]
                for item in items
            ]
        )

        response = requests.post(
            slack_url,
            json={
                "blocks": payload,
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
