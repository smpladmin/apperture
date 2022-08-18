from abc import ABC, abstractmethod


class Strategy(ABC):
    @abstractmethod
    def execute(self, email: str, view_id: str):
        raise NotImplementedError()
