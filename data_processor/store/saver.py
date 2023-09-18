from abc import ABC, abstractmethod
import pandas as pd

from domain.common.models import IntegrationProvider


class Saver(ABC):
    @abstractmethod
    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        pass
