from abc import ABC, abstractmethod
import pandas as pd

from dags.domain.datasource.models import IntegrationProvider


class Saver(ABC):
    @abstractmethod
    def save(self, datasource_id: str, provider: IntegrationProvider, df: pd.DataFrame):
        pass
