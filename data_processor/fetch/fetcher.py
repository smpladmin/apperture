from abc import ABC, abstractmethod
from pandas import DataFrame


class Fetcher(ABC):
    @abstractmethod
    def daily_data(self, view_id: str) -> DataFrame:
        pass

    @abstractmethod
    def monthly_data(self) -> DataFrame:
        pass
