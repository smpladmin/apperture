import logging
from domain.common.models import IntegrationProvider
from .google_analytics_4_strategy import (
    GoogleAnalytics4Strategy,
)
from .google_analytics_strategy import GoogleAnalyticsStrategy
from .mixpanel_analytics_strategy import (
    MixpanelAnalyticsStrategy,
)


class StrategyBuilder:
    @staticmethod
    def build(
        provider: str,
        version: str,
        access_token: str,
        refresh_token: str,
        datasource_id: str,
    ):
        logging.debug(
            f"{provider}, {version}, {access_token}, {refresh_token}, {datasource_id} "
        )
        if provider == IntegrationProvider.GOOGLE and version == "V3":
            return GoogleAnalyticsStrategy(
                access_token,
                refresh_token,
                datasource_id,
                IntegrationProvider.GOOGLE,
            )
        elif provider == IntegrationProvider.GOOGLE and version == "V4":
            logging.debug("selected v4 strategy")
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
