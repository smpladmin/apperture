from abc import ABC, abstractmethod
import pandas as pd

from domain.common.models import IntegrationProvider
from store import Clickhouse


class Saver(Clickhouse):
    @abstractmethod
    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        pass
