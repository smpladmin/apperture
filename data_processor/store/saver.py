from abc import ABC, abstractmethod
import pandas as pd


class Saver(ABC):
    @abstractmethod
    def save(self, view_id: str, df: pd.DataFrame):
        pass
