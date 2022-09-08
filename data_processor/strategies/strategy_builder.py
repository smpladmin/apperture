from .google_analytics_4_strategy import (
    GoogleAnalytics4Strategy,
)
from .google_analytics_strategy import GoogleAnalyticsStrategy
from .mixpanel_analytics_strategy import (
    MixpanelAnalyticsStrategy,
)


class StrategyBuilder:
    @staticmethod
    def build(provider: str, version: str, access_token: str, refresh_token: str):
        if provider == "GOOGLE" and version == "V3":
            return GoogleAnalyticsStrategy(access_token, refresh_token)
        elif provider == "GOOGLE" and version == "V4":
            return GoogleAnalytics4Strategy(access_token, refresh_token)
        elif provider == "MIXPANEL":
            return MixpanelAnalyticsStrategy()
        else:
            raise NotImplementedError(
                f"Strategy not implemented for given provider - {provider}"
            )
