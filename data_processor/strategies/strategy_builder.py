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
from strategies.amplitude_events_strategy import AmplitudeEventsStrategy
from strategies.clevertap_events_strategy import ClevertapEventsStrategy
from strategies.api_data_strategy import APIDataStrategy


class StrategyBuilder:
    @staticmethod
    def build(
        provider: str,
        version: str,
        access_token: str,
        refresh_token: str,
        datasource_id: str,
    ):
        strategies = {
            IntegrationProvider.GOOGLE: {
                "V3": GoogleAnalyticsStrategy(
                    access_token,
                    refresh_token,
                    datasource_id,
                    IntegrationProvider.GOOGLE,
                ),
                "V4": GoogleAnalytics4Strategy(
                    access_token,
                    refresh_token,
                    datasource_id,
                    IntegrationProvider.GOOGLE,
                ),
            },
            IntegrationProvider.MIXPANEL: {"DEFAULT": MixpanelAnalyticsStrategy()},
            IntegrationProvider.API: {"DEFAULT": APIDataStrategy()},
        }
        if not strategies[provider][version]:
            raise NotImplementedError(
                f"Strategy not implemented for given provider - {provider}"
            )
        return strategies[provider][version]


class EventsStrategyBuilder:
    @staticmethod
    def build(
        datasource: DataSource, credential: Credential, runlog_id: str, date: str
    ):
        strategies = {
            IntegrationProvider.MIXPANEL: {
                "DEFAULT": MixpanelEventsStrategy(
                    datasource, credential, runlog_id, date
                )
            },
            IntegrationProvider.AMPLITUDE: {
                "DEFAULT": AmplitudeEventsStrategy(
                    datasource, credential, runlog_id, date
                )
            },
            IntegrationProvider.CLEVERTAP: {
                "DEFAULT": ClevertapEventsStrategy(
                    datasource, credential, runlog_id, date
                )
            },
            IntegrationProvider.API: {
                "DEFAULT": APIDataStrategy(
                    datasource, credential, runlog_id, date
                )
            },
        }
        if not strategies[datasource.provider][datasource.version]:
            raise NotImplementedError(
                f"Strategy not implemented for given provider - {datasource.provider}"
            )
        return strategies[datasource.provider][datasource.version]


class NotificationStrategyBuilder:
    @staticmethod
    def build(user_id: str, channel=NotificationChannel.SLACK):
        if channel == NotificationChannel.SLACK:
            return SlackNotificationStrategy(user_id, channel)
        else:
            raise NotImplementedError(
                f"Strategy not implemented for channel - {channel}"
            )
