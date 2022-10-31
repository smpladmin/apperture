from abc import ABC, abstractmethod


class EventProcessor(ABC):
    @abstractmethod
    def process(self,events_data):
        raise NotImplementedError()