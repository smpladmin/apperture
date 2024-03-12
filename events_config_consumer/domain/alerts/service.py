import logging
from typing import Optional
import requests

from settings import events_settings


class AlertService:
    def __init__(self):
        self.settings = events_settings()
        self.slack_url = self.settings.slack_url

    def post_message_to_slack(
        self, message: str, alert_type: str, slack_url: Optional[str] = None
    ):
        slack_hook = slack_url or self.slack_url
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
                slack_hook,
                json={
                    "blocks": payload,
                },
            )
        except Exception as e:
            logging.info(f"Failed to send alert to Slack {slack_hook} {e}")
        return
