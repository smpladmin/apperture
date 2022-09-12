import logging
import pandas as pd

from domain.common.models import IntegrationProvider
from .saver import Saver


class MixpanelNetworkGraphSaver(Saver):
    def __init__(self):
        self.table = "mixpanel_visualization_data"
        self.schema = "perpendicular"

    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        pass
