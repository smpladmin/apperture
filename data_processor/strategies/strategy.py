from abc import ABC, abstractmethod


class Strategy(ABC):
    @abstractmethod
    def execute(self, email: str, external_source_id: str):
        raise NotImplementedError()
