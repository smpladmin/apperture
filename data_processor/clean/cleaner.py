from abc import ABC, abstractmethod
import pandas as pd


class Cleaner(ABC):
    @abstractmethod
    def clean(self, df: pd.DataFrame) -> pd.DataFrame:
        pass
