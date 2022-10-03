import logging
from domain.common.models import IntegrationProvider
from domain.notification.models import NotificationChannel
from strategies.slack_notification_strategy import SlackNotificationStrategy
from .google_analytics_4_strategy import (
    GoogleAnalytics4Strategy,
)
from .google_analytics_strategy import GoogleAnalyticsStrategy
from .mixpanel_analytics_strategy import (
    MixpanelAnalyticsStrategy,
)
from domain.common.models import IntegrationProvider
from domain.datasource.models import Credential, DataSource
from strategies.mixpanel_events_strategy import MixpanelEventsStrategy


class StrategyBuilder:
    @staticmethod
    def build(
        provider: str,
        version: str,
        access_token: str,
        refresh_token: str,
        datasource_id: str,
    ):
        if provider == IntegrationProvider.GOOGLE and version == "V3":
            return GoogleAnalyticsStrategy(
                access_token,
                refresh_token,
                datasource_id,
                IntegrationProvider.GOOGLE,
            )
        elif provider == IntegrationProvider.GOOGLE and version == "V4":
            return GoogleAnalytics4Strategy(
                access_token,
                refresh_token,
                datasource_id,
                IntegrationProvider.GOOGLE,
            )
        elif provider == IntegrationProvider.MIXPANEL:
            return MixpanelAnalyticsStrategy()
        else:
            raise NotImplementedError(
                f"Strategy not implemented for given provider - {provider}"
            )


class EventsStrategyBuilder:
    @staticmethod
    def build(
        datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        if (
            datasource.provider == IntegrationProvider.MIXPANEL
            and datasource.version == "DEFAULT"
        ):
            return MixpanelEventsStrategy(datasource, credential, runlog_id, date)
        else:
            raise NotImplementedError(
                f"Strategy not implemented for given provider - {datasource.provider}"
            )


class NotificationStrategyBuilder:
    @staticmethod
    def build(user_id: str, channel=NotificationChannel.SLACK):
        if channel == NotificationChannel.SLACK:
            return SlackNotificationStrategy(user_id, channel)
        else:
            raise NotImplementedError(
                f"Strategy not implemented for channel - {channel}"
            )
