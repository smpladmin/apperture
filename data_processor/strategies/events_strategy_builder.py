import logging
from domain.common.models import IntegrationProvider
from domain.datasource.models import Credential, DataSource
from strategies.mixpanel_events_strategy import MixpanelEventsStrategy


class EventsStrategyBuilder:
    @staticmethod
    def build(datasource: DataSource, credential: Credential, date: str):
        if (
            datasource.provider == IntegrationProvider.MIXPANEL
            and datasource.version == "DEFAULT"
        ):
            return MixpanelEventsStrategy(datasource, credential, date)
        else:
            raise NotImplementedError(
                f"Strategy not implemented for given provider - {datasource.provider}"
            )
