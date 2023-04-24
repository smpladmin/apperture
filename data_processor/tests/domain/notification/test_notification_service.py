import pytest
from unittest.mock import MagicMock, ANY, patch

from domain.notification.service import NotificationService
from domain.notification.models import (
    Notification,
    NotificationType,
    NotificationVariant,
    NotificationThresholdType,
    ThresholdMap,
    NotificationChannel,
)
from apperture.backend_action import get


class TestNotificationService:
    def setup_method(self):

        self.service = NotificationService()
        self.channel = NotificationChannel.SLACK
        self.slack_url = "https://hooks.slack.com/services/T0MUGH/B052MN3/hot22Qj1"
        self.alerts = [
            Notification(
                name="Video Funnel",
                notification_type=NotificationType.ALERT,
                variant=NotificationVariant.FUNNEL,
                value=-16.67,
                original_value=0.1,
                reference="639237437483490",
                threshold_type=NotificationThresholdType.PCT,
                user_threshold=ThresholdMap(min=12.0, max=18.0),
                triggered=True,
            ),
            Notification(
                name="Alert Metric",
                notification_type=NotificationType.ALERT,
                variant=NotificationVariant.METRIC,
                value=-16.67,
                original_value=0.1,
                reference="6777439823920337",
                threshold_type=NotificationThresholdType.PCT,
                user_threshold=ThresholdMap(min=1212.0, max=3236.0),
                triggered=False,
            ),
        ]

        self.updates = [
            Notification(
                name="Video Funnel",
                notification_type=NotificationType.UPDATE,
                variant=NotificationVariant.FUNNEL,
                value=-16.67,
                original_value=0.1,
                reference="639237437483490",
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
            Notification(
                name="Alert Metric",
                notification_type=NotificationType.UPDATE,
                variant=NotificationVariant.METRIC,
                value=-16.67,
                original_value=0.1,
                reference="6777439823920337",
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
        ]

        self.notifications = [
            Notification(
                name="Video Funnel",
                notification_type=NotificationType.ALERT,
                variant=NotificationVariant.FUNNEL,
                value=-16.67,
                original_value=0.1,
                reference="639237437483490",
                threshold_type=NotificationThresholdType.PCT,
                user_threshold=ThresholdMap(min=12.0, max=18.0),
                triggered=True,
            ),
            Notification(
                name="Alert Metric",
                notification_type=NotificationType.ALERT,
                variant=NotificationVariant.METRIC,
                value=-16.67,
                original_value=0.1,
                reference="6777439823920337",
                threshold_type=NotificationThresholdType.PCT,
                user_threshold=ThresholdMap(min=1212.0, max=3236.0),
                triggered=False,
            ),
            Notification(
                name="Video Funnel",
                notification_type=NotificationType.UPDATE,
                variant=NotificationVariant.FUNNEL,
                value=-16.67,
                original_value=0.1,
                reference="639237437483490",
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
            Notification(
                name="Alert Metric",
                notification_type=NotificationType.UPDATE,
                variant=NotificationVariant.METRIC,
                value=-16.67,
                original_value=0.1,
                reference="6777439823920337",
                threshold_type=None,
                user_threshold=None,
                triggered=None,
            ),
        ]

    def test_fetch_notifications(self):
        response = MagicMock()
        response.ok = True
        response.json = MagicMock(return_value=self.notifications)
        with patch(
            "domain.notification.service.get",
            return_value=response,
        ):
            assert (
                self.service.fetch_notifications(user_id="6573239747732")
                == self.notifications
            )

    def test_fetch_notifications_with_exception(self):
        response = MagicMock()
        response.ok = False
        with patch(
            "domain.notification.service.get",
            return_value=response,
        ):
            with pytest.raises(
                Exception,
                match="Error fetching notifications for user 6573239747732",
            ):
                self.service.fetch_notifications(user_id="6573239747732")

    @pytest.mark.parametrize("value, result", [(-3, "3% lower"), (3, "3% higher")])
    def test_get_value_change_text(self, value: float, result: str):
        assert self.service.get_value_change_text(value=value) == result

    @pytest.mark.parametrize(
        "value, variant, result",
        [
            (-3, NotificationVariant.FUNNEL, "-3%"),
            (3, NotificationVariant.METRIC, "3"),
        ],
    )
    def test_get_original_value_text(
        self, value: float, variant: NotificationVariant, result: str
    ):
        assert (
            self.service.get_original_value_text(value=value, variant=variant) == result
        )

    @pytest.mark.parametrize(
        "alert, result",
        [
            (
                Notification(
                    name="Video Funnel",
                    notification_type=NotificationType.ALERT,
                    variant=NotificationVariant.FUNNEL,
                    value=-16.67,
                    original_value=0.1,
                    reference="639237437483490",
                    threshold_type=NotificationThresholdType.PCT,
                    user_threshold=ThresholdMap(min=12.0, max=18.0),
                    triggered=True,
                ),
                "reduced by more than 16.67% yesterday",
            ),
            (
                Notification(
                    name="Alert Metric",
                    notification_type=NotificationType.ALERT,
                    variant=NotificationVariant.METRIC,
                    value=-16.67,
                    original_value=0.1,
                    reference="6777439823920337",
                    threshold_type=NotificationThresholdType.ABSOLUTE,
                    user_threshold=ThresholdMap(min=-3, max=3),
                    triggered=False,
                ),
                "dropped below -3.0 yesterday",
            ),
        ],
    )
    def test_get_alert_threshold_text(self, alert, result):
        assert self.service.get_alert_threshold_text(alert=alert) == result

    def test_send_updates(self):
        response = MagicMock()
        response.ok = True
        response.json = MagicMock(return_value=self.notifications)
        response.status_code = 200
        with patch(
            "domain.notification.service.requests.post",
            return_value=response,
        ) as mock_post:
            self.service.send_updates(updates=self.updates, slack_url=self.slack_url)
            mock_post.assert_called_once_with(
                "https://hooks.slack.com/services/T0MUGH/B052MN3/hot22Qj1",
                json={
                    "attachments": [
                        {
                            "color": "#9733EE",
                            "fields": [
                                {
                                    "title": "Here is an update! :zap:",
                                    "value": '"Video Funnel" funnel was 0.1% yesterday. This was 16.67% lower compared to previous day.'
                                    '\n"Alert Metric" metric was 0.1 yesterday. This was 16.67% lower compared to previous day.',
                                    "short": "false",
                                }
                            ],
                        }
                    ]
                },
            )

    def test_send_alerts(self):
        response = MagicMock()
        response.ok = True
        response.json = MagicMock(return_value=self.notifications)
        response.status_code = 200
        with patch(
            "domain.notification.service.requests.post",
            return_value=response,
        ) as mock_post:
            self.service.send_alerts(alerts=self.alerts, slack_url=self.slack_url)
            mock_post.assert_called_once_with(
                "https://hooks.slack.com/services/T0MUGH/B052MN3/hot22Qj1",
                json={
                    "attachments": [
                        {
                            "color": "#9733EE",
                            "fields": [
                                {
                                    "title": "Here is your alert! :zap:",
                                    "value": 'Alert! "Video Funnel" reduced by more than 16.67% yesterday'
                                    '\nAlert! "Alert Metric" reduced by more than 16.67% yesterday',
                                    "short": "false",
                                }
                            ],
                        }
                    ]
                },
            )

    def test_send_notifications(self):

        self.service.send_updates = MagicMock()
        self.service.send_alerts = MagicMock()

        self.service.send_notification(
            notifications=self.notifications,
            slack_url=self.slack_url,
            channel=self.channel,
        )

        self.service.send_updates.assert_called_once_with(
            [
                Notification(
                    name="Video Funnel",
                    notification_type=NotificationType.UPDATE,
                    variant=NotificationVariant.FUNNEL,
                    value=-16.67,
                    original_value=0.1,
                    reference="639237437483490",
                    threshold_type=None,
                    user_threshold=None,
                    triggered=None,
                ),
                Notification(
                    name="Alert Metric",
                    notification_type=NotificationType.UPDATE,
                    variant=NotificationVariant.METRIC,
                    value=-16.67,
                    original_value=0.1,
                    reference="6777439823920337",
                    threshold_type=None,
                    user_threshold=None,
                    triggered=None,
                ),
            ],
            "https://hooks.slack.com/services/T0MUGH/B052MN3/hot22Qj1",
        )

        self.service.send_alerts.assert_called_with(
            [
                Notification(
                    name="Video Funnel",
                    notification_type=NotificationType.ALERT,
                    variant=NotificationVariant.FUNNEL,
                    value=-16.67,
                    original_value=0.1,
                    reference="639237437483490",
                    threshold_type=NotificationThresholdType.PCT,
                    user_threshold=ThresholdMap(min=12.0, max=18.0),
                    triggered=True,
                )
            ],
            "https://hooks.slack.com/services/T0MUGH/B052MN3/hot22Qj1",
        )
