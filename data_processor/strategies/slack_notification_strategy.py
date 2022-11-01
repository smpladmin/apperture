from domain.notification.service import NotificationService


class SlackNotificationStrategy:
    def __init__(self, user_id: str, channel: str):
        self.user_id = user_id
        self.channel = channel
        self.service = NotificationService()

    def execute(self):
        notifications = self.service.fetch_notifications(self.user_id)
        slack_url = self.service.fetch_slack_url(self.user_id)
        self.service.send_notification(notifications, self.channel, slack_url)
